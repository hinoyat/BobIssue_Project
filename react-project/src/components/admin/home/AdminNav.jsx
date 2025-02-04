import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { userReducerActions } from '../../../redux/reducers/userSlice'
import API from '../../../utils/API'
import { useSelector } from 'react-redux'

const AdminNav = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return null // 로그인되지 않은 경우 네비바를 렌더링하지 않음
  }
  // 🔥 로그아웃 핸들러
  const handleLogout = (e) => {
    e.preventDefault()
    API.post('/auths/logout')
      .then((res) => {
        dispatch(userReducerActions.logout())
        navigate('/admin')
      })
      .catch((error) => {
        console.log('로그아웃 실패:', error)
      })
  }

  return (
    <nav className='fixed top-0 left-64 w-[calc(100%-16rem)] bg-white shadow-md z-50'>
      <div className='px-6 py-3 flex justify-between items-center'>
        {/* 페이지 제목 */}
        <h1 className='text-lg font-bold text-gray-800'>관리자 페이지</h1>

        {/* 관리자 정보 및 로그아웃 버튼 */}
        <div className='flex items-center space-x-4'>
          <div className='text-gray-800 font-medium'>admin님</div>
          <button
            onClick={handleLogout}
            className='text-black px-4 py-2 rounded-md hover:bg-gray-200 transition'
          >
            로그아웃
          </button>
        </div>
      </div>
    </nav>
  )
}

export default AdminNav
