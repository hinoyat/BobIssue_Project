import React, { useState, useEffect } from 'react'
import Breadcrumb from '../common/Breadcrumb'
import API from '../../../utils/API'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

const LiveManagement = () => {
  const breadcrumbPaths = [
    { name: 'Home' },
    { name: '라이브커머스 관리' },
    { name: '라이브커머스 신청관리' },
  ]

  const navigate = useNavigate()

  const currentMonth = moment().format('YYYYMM') // 현재 신청하는 월 (예: 202502)
  const nextMonth = moment().add(1, 'months').format('YYYYMM') // 방송 예정 월 (예: 202503)

  const [applications, setApplications] = useState([]) // 신청 목록 (등록)
  const [approvedApplications, setApprovedApplications] = useState([]) // 승인 목록 (대기)
  const [rejectedApplications, setRejectedApplications] = useState([]) // 거절 목록 (거절)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await API.get('/cast')
        console.log('📌 신청목록 데이터:', response.data)

        // ✅ 현재 신청 월(2월)과 방송 예정 월(3월)에 맞는 데이터만 필터링
        const filteredApplications =
          response.data?.result?.data.filter(
            (app) =>
              moment(app.createAt, 'YYYYMMDD HHmmss').format('YYYYMM') === currentMonth && // 신청 월이 현재(2월)인 경우
              moment(app.startAt, 'YYYYMMDD HHmmss').format('YYYYMM') === nextMonth, // 방송 월이 3월인 경우
          ) || []

        // ✅ 상태별로 분류 (등록 / 대기 / 거절)
        setApplications(filteredApplications.filter((app) => app.castStatus === '등록')) // 신청 목록
        setApprovedApplications(filteredApplications.filter((app) => app.castStatus === '대기')) // 승인 목록
        setRejectedApplications(filteredApplications.filter((app) => app.castStatus === '거절')) // 거절 목록
      } catch (error) {
        console.error('❌ 신청 목록 불러오기 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const handleViewDetails = (castNo) => {
    navigate(`/admin/live/register/${castNo}`)
  }

  // ✅ 승인 처리 (PATCH 요청)
  const handleApprove = async (castNo) => {
    try {
      await API.patch(`/cast/${castNo}/accept`)
      alert('승인 완료!')
      window.location.reload() // 페이지 새로고침하여 목록 업데이트
    } catch (error) {
      console.error('❌ 승인 실패:', error)
    }
  }

  // ❌ 반려 처리 (PATCH 요청)
  const handleReject = async (castNo) => {
    try {
      await API.patch(`/cast/${castNo}/refusal`)
      alert('반려 완료!')
      window.location.reload() // 페이지 새로고침하여 목록 업데이트
    } catch (error) {
      console.error('❌ 반려 실패:', error)
    }
  }

  return (
    <div className='p-6'>
      <Breadcrumb paths={breadcrumbPaths} />
      <h2 className='text-2xl font-bold mb-6'>라이브커머스 신청관리</h2>

      {/* ✅ {nextMonth} 방송을 위한 신청자 목록 (현재 {currentMonth}에 신청됨) */}
      <h2 className='text-lg font-bold mb-6'>
        ✅ {moment(nextMonth, 'YYYYMM').format('M월')} 라이브 신청자 목록
      </h2>
      <TableComponent
        data={applications}
        handleViewDetails={handleViewDetails}
        handleApprove={handleApprove}
        handleReject={handleReject}
        showActions={true} // ✅ 승인/반려 버튼 활성화
        emptyMessage={`신청된 ${moment(nextMonth, 'YYYYMM').format('M월')} 라이브가 없습니다.`}
      />

      {/* ✅ {nextMonth} 방송을 위한 승인 목록 */}
      <h2 className='text-lg font-bold mt-10 mb-6'>
        ✅ {moment(nextMonth, 'YYYYMM').format('M월')} 라이브 승인 목록
      </h2>
      <TableComponent
        data={approvedApplications}
        handleViewDetails={handleViewDetails}
        showActions={false} // 승인된 방송은 승인/반려 버튼 X
        emptyMessage={`승인된 ${moment(nextMonth, 'YYYYMM').format('M월')} 라이브가 없습니다.`}
      />

      {/* ❌ {nextMonth} 방송을 위한 반려 목록 */}
      <h2 className='text-lg font-bold mt-10 mb-6'>
        ❌ {moment(nextMonth, 'YYYYMM').format('M월')} 라이브 반려 목록
      </h2>
      <TableComponent
        data={rejectedApplications}
        handleViewDetails={handleViewDetails}
        showActions={false} // 반려된 방송은 승인/반려 버튼 X
        emptyMessage={`거절된 ${moment(nextMonth, 'YYYYMM').format('M월')} 라이브가 없습니다.`}
      />
    </div>
  )
}

// ✅ 공통 테이블 컴포넌트
const TableComponent = ({
  data,
  handleViewDetails,
  handleApprove,
  handleReject,
  showActions,
  emptyMessage,
}) => (
  <table className='table-auto w-full border'>
    <thead>
      <tr className='bg-gray-100'>
        <th className='border px-4 py-2'>번호</th>
        <th className='border px-4 py-2'>판매자</th>
        <th className='border px-4 py-2'>방송 제목</th>
        <th className='border px-4 py-2'>방송 시작</th>
        <th className='border px-4 py-2'>방송 종료</th>
        <th className='border px-4 py-2'>신청자료</th>
        {showActions && <th className='border px-4 py-2'>승인/반려</th>}
      </tr>
    </thead>
    <tbody>
      {data.map((app, index) => (
        <tr key={app.castNo}>
          <td className='border px-4 py-2 text-center'>{index + 1}</td>
          <td className='border px-4 py-2 text-center'>{app.createdUser.split(' ')[1]}</td>
          <td className='border px-4 py-2 text-center'>{app.title}</td>
          <td className='border px-4 py-2 text-center'>
            {moment(app.startAt, 'YYYYMMDD HHmmss').format('MM월 DD일 HH시 mm분')}
          </td>
          <td className='border px-4 py-2 text-center'>
            {moment(app.endAt, 'YYYYMMDD HHmmss').format('MM월 DD일 HH시 mm분')}
          </td>
          <td className='border px-4 py-2 text-center'>
            <button
              onClick={() => handleViewDetails(app.castNo)}
              className='text-blue-500 hover:underline'
            >
              <Search size={20} strokeWidth={2} />
            </button>
          </td>
          {showActions && (
            <td className='border px-4 py-2 text-center'>
              <button
                onClick={() => handleApprove(app.castNo)}
                className='bg-blue-500 text-white px-3 py-1 rounded mr-2'
              >
                승인
              </button>
              <button
                onClick={() => handleReject(app.castNo)}
                className='bg-red-500 text-white px-3 py-1 rounded'
              >
                반려
              </button>
            </td>
          )}
        </tr>
      ))}
      {data.length === 0 && (
        <tr>
          <td colSpan={showActions ? '7' : '6'} className='text-center py-4'>
            {emptyMessage}
          </td>
        </tr>
      )}
    </tbody>
  </table>
)

export default LiveManagement
