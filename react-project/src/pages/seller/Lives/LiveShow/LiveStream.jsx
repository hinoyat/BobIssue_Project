import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import moment from 'moment'

const LiveStreamSetup = () => {
  const debug_mode =localStorage.getItem('debug_mode')
  const location = useLocation()
  const event = location.state?.event
  const videoRef = useRef(null)
  const wsRef = useRef(null) // 📌 웹소켓 참조 추가
  const [stream, setStream] = useState(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [messages, setMessages] = useState([]) // 📌 채팅 메시지 상태 추가
  const [inputMessage, setInputMessage] = useState('')

  // 📌 현재 날짜 및 시간 정보 가져오기
  const now = moment()
  const eventDate = moment(event?.date, 'YYYY-MM-DD')
  const eventStartTime = moment(`${event?.date}T${event?.time.split('-')[0]}`, 'YYYY-MM-DDTHH:mm')
  const eventEndTime = moment(eventStartTime).add(event?.duration || 60, 'minutes')

  // 📌 라이브 시작 가능 여부 체크
// 📌 라이브 시작 가능 여부 체크 (디버그 모드일 경우 항상 가능)
const isLiveAvailable = debug_mode === 'true' || (event && now.isBetween(eventStartTime, eventEndTime));


  // 📌 웹캠(미리보기) 설정
  useEffect(() => {
    const setupStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error) {
        console.error('미디어 장치를 가져오는 데 실패했습니다.', error)
      }
    }

    setupStream()
  }, [])

  // 📌 방송 시작 / 중지 핸들러
  const handleStreamToggle = () => {
    if (!isLiveAvailable) return

    if (isStreaming) {
      stream.getTracks().forEach((track) => track.stop()) // 모든 미디어 트랙 중지
      setStream(null)
      setIsStreaming(false)

      // 📌 웹소켓 종료
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: cameraOn, audio: micOn })
        .then((mediaStream) => {
          setStream(mediaStream)
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream
          }
        })
        .catch((error) => console.error('미디어 장치를 가져오는 데 실패했습니다.', error))

      setIsStreaming(true)

      // 📌 웹소켓 연결
      wsRef.current = new WebSocket('wss://your-server-url.com/live') // 서버 URL 변경

      wsRef.current.onopen = () => {
        console.log('웹소켓 연결됨')
      }

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data)
        setMessages((prev) => [...prev, message]) // 📌 메시지를 리스트에 추가
      }

      wsRef.current.onclose = () => {
        console.log('웹소켓 연결 종료')
      }
    }
  }

  // 📌 마이크 토글
  const handleMicToggle = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !micOn))
    }
    setMicOn(!micOn)
  }

  // 📌 카메라 토글
  const handleCameraToggle = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !cameraOn))
    }
    setCameraOn(!cameraOn)
  }

  // 📌 채팅 메시지 전송
  const sendMessage = () => {
    if (wsRef.current && inputMessage.trim() !== '') {
      const messageData = { user: '방송자', text: inputMessage }
      wsRef.current.send(JSON.stringify(messageData))
      setMessages((prev) => [...prev, messageData])
      setInputMessage('')
    }
  }

  return (
    <div className='p-6'>
      <h1 className='font-bold text-[32px] mb-4'>라이브 방송 환경 설정</h1>

      {!isLiveAvailable && (
        <div className='text-red-500 text-lg font-semibold mb-4'>
          🚫 라이브 방송은 {event?.date} {event?.time} 동안에만 가능합니다.
        </div>
      )}

      {/* 📌 방송 화면 미리보기 */}
      <div className='relative border p-4 rounded-lg shadow-md bg-black w-full mx-auto'>
        <video ref={videoRef} autoPlay playsInline className='w-full h-[500px] bg-black'></video>
      </div>

      {/* 📌 컨트롤 버튼 */}
      <div className='flex justify-center mt-4 space-x-4'>
        <button
          onClick={handleStreamToggle}
          className={`px-4 py-2 font-bold text-white rounded ${
            isLiveAvailable
              ? isStreaming
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!isLiveAvailable}
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

      {/* 📌 채팅 UI */}
      <div className='mt-6 border p-4 rounded-lg shadow-md bg-gray-100 max-w-3xl mx-auto'>
        <h2 className='font-semibold text-lg mb-2'>실시간 채팅</h2>
        <div className='h-60 overflow-y-auto border p-2 bg-white rounded'>
          {messages.map((msg, idx) => (
            <div key={idx} className='p-2 border-b'>
              <strong>{msg.user}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <div className='mt-2 flex'>
          <input
            className='flex-1 border p-2 rounded'
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder='메시지를 입력하세요...'
          />
          <button onClick={sendMessage} className='ml-2 px-4 py-2 bg-blue-500 text-white rounded'>
            전송
          </button>
        </div>
      </div>
    </div>
  )
}

export default LiveStreamSetup
