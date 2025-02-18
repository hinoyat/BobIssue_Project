import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import moment from 'moment'
import API from '@/utils/API' // API 호출용
import { OpenVidu } from 'openvidu-browser' // ✅ OpenVidu 라이브러리 추가
import SockJS from 'sockjs-client' // ✅ SockJS 사용
import { Client } from '@stomp/stompjs' // ✅ STOMP 사용
import LiveChat from './LiveChat.jsx' // ✅ 채팅 컴포넌트
import axios from 'axios' // axios 임포트 추가

const LiveStreamSetup = () => {
  
  const debug_mode = localStorage.getItem('debug_mode') === 'true'
  const location = useLocation()
  const event = location.state?.event
  const videoRef = useRef(null)
  const stompClientRef = useRef(null) // 📌 STOMP 클라이언트 참조 추가
  const [stream, setStream] = useState(null)
  const [session, setSession] = useState(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [chatActive, setChatActive] = useState(false) // 📌 채팅 활성화 여부 추가

  // 📌 현재 시간 계산
  const now = moment()
  const startAt = event?.startAt ? moment(event.startAt, 'YYYYMMDD HHmmss') : null
  const endAt = event?.endAt ? moment(event.endAt, 'YYYYMMDD HHmmss') : null
  const isLiveAvailable = startAt && endAt && now.isBetween(startAt, endAt)

  // 📌 마이크 및 비디오 ON/OFF 시 스트림 재설정
  useEffect(() => {
    const setupStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: cameraOn,
          audio: micOn,
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error) {
        console.error('❌ 미디어 장치를 가져오는 데 실패했습니다.', error)
      }
    }
    setupStream()
  }, [cameraOn, micOn]) // 마이크 또는 카메라 상태 변경 시 다시 스트림 설정

  // 방송 시작 (joinSession)
  const joinSession = async () => {

    console.log("제발되라!!!!")
    const ws = new WebSocket("wss://bobissue.store/openvidu?sessionId=cast3");
    ws.onopen = () => console.log("✅ WebSocket 연결 성공!");
    ws.onerror = (error) => console.error("❌ WebSocket 연결 실패", error);

    const OV = new OpenVidu();

    const mySession = OV.initSession();
    
    setSession(mySession);

    mySession.on('streamCreated', (event) => {
      const subscriber = mySession.subscribe(event.stream, undefined);
    });

    mySession.on('streamDestroyed', (event) => {
      // Handle stream destroyed
    });

    mySession.on('exception', (exception) => {
      console.warn(exception);
    });
    

    // 배포된 OpenVidu 서버에서 토큰 가져오기
    try {
      // const token = await getToken(); // getToken()을 사용하여 토큰을 받아옴
      console.log("접속 드가자")
      await mySession.connect("wss://bobissue.store/openvidu?sessionId=cast1&token=tok_Et8YBCEvkhm5DVbI", {  });

      const publisher = await OV.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
        mirror: false,
      });

      mySession.publish(publisher);
      setSession(mySession);
      setIsStreaming(true);
      setChatActive(true);
    } catch (error) {
      console.error('❌ OpenVidu 연결 실패:', error);
    }
  };

  // 방송 끄기 (leaveSession)
  const leaveSession = () => {
    const mySession = session;
    if (mySession) {
      mySession.disconnect();
    }
    setSession(null);
    setIsStreaming(false);
    setChatActive(false);
    setStream(null);
  };




  // 📌 방송 시작 / 중지 핸들러
  const handleStreamToggle = async () => {
    if (isStreaming) {
      leaveSession(); // 방송 종료
    } else {
      joinSession(); // 방송 시작
    }
  };


    // 📌 토큰 가져오기
    const getToken = async () => {
      const sessionId = await createSession(event.id)
      return await createToken(sessionId)
    }
  
    // 📌 세션 생성
    const createSession = async (sessionId) => {
      const response = await axios.post('https://bobissue.store/api/openvidu/sessions', { customSessionId: "cast3" }, {
        headers: { 'Content-Type': 'application/json' },
      })
      return response.data
    }
  
    // 📌 토큰 생성
    const createToken = async (sessionId) => {
      const response = await axios.post('https://bobissue.store/api/openvidu/sessions/cast3/connections', {}, {
        headers: { 'Content-Type': 'application/json' },
      })
      return response.data
    }
  

  // 📌 마이크 토글 핸들러
  const handleMicToggle = () => {
    setMicOn((prevMicOn) => !prevMicOn)
  }

  // 📌 카메라 토글 핸들러
  const handleCameraToggle = () => {
    setCameraOn((prevCameraOn) => !prevCameraOn)
  }

  return (
    <div className='p-6'>
      <h1 className='font-bold text-[32px] mb-4'>라이브 방송 환경 설정</h1>

      {!isLiveAvailable && !debug_mode && (
        <div className='text-red-500 text-lg font-semibold mb-4'>
          🚫 라이브 방송은 {startAt?.format('YYYY-MM-DD HH:mm')} ~ {endAt?.format('HH:mm')} 동안에만
          가능합니다.
        </div>
      )}

      {/* 📌 방송 화면 미리보기 */}
      <div className='relative border rounded-lg shadow-md bg-black w-full mx-auto'>
        <video ref={videoRef} autoPlay playsInline className='w-full h-[500px] bg-black'></video>
      </div>

      {/* 📌 컨트롤 버튼 */}
      <div className='flex justify-center mt-4 space-x-4'>
        <button
          onClick={handleStreamToggle}
          className={`px-4 py-2 font-bold text-white rounded ${
            isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
          disabled={!debug_mode && !isLiveAvailable}
        >
          {isStreaming ? '방송 중지' : '방송 시작'}
        </button>

        <button
          onClick={handleMicToggle}
          className={`px-4 py-2 font-bold text-white rounded ${
            micOn ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'
          }`}
        >
          {micOn ? '마이크 끄기' : '마이크 켜기'}
        </button>

        <button
          onClick={handleCameraToggle}
          className={`px-4 py-2 font-bold text-white rounded ${
            cameraOn ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'
          }`}
        >
          {cameraOn ? '카메라 끄기' : '카메라 켜기'}
        </button>
      </div>

      {/* 📌 채팅 UI (방송이 켜진 경우에만) */}
      {chatActive && <LiveChat channelId={event?.id || 'defaultStreamKey'} />}
    </div>
  )
}

export default LiveStreamSetup
