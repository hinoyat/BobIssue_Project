import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../common/Breadcrumb'
import API from '../../../utils/API'
import { Search } from 'lucide-react'

const MemberInfoManagement = () => {
  const breadcrumbPaths = [{ name: 'Home' }, { name: '회원관리' }, { name: '회원정보관리' }]
  const navigate = useNavigate()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchType, setSearchType] = useState('user-no')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    console.log('🔍 useEffect 실행됨, 현재 경로:', window.location.pathname)
    if (window.location.pathname === '/users') {
      console.warn('🚨 예상치 못한 /users 이동 발생!')
    }
    fetchUsers()

    return () => {
      console.log('🛑 useEffect Cleanup 실행됨')
    }
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await API.get('/users')
      console.log('🛠 API 응답:', response.data)

      if (response.status === 302) {
        console.warn('🚨 API에서 강제 리다이렉트 감지!')
      }

      setFilteredUsers(response.data.result.data)
    } catch (error) {
      console.error('회원 조회 중 오류 발생:', error)
      alert('회원 조회에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const response = await API.get('/users')
      setFilteredUsers(response.data.result.data)
      setCurrentPage(1)
    } catch (error) {
      console.error('회원 조회 중 오류 발생:', error)
      alert('회원 조회에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNavigateToDetail = (userNo) => {
    navigate(`/admin/members/${userNo}`)
  }

  const handleDeleteUser = async (userNo) => {
    if (!window.confirm('해당 회원을 삭제하시겠습니까?')) return

    try {
      await API.delete(`/users/${userNo}`)
      alert('회원이 삭제되었습니다.')

      fetchUsers()
      console.log('🚀 회원 삭제 후 navigate 실행!')
      navigate('/admin/members/info', { replace: true })
    } catch (error) {
      console.error('회원 삭제 오류:', error)
      alert('회원 삭제에 실패했습니다.')
    }
  }

  // handleToggleStatus 함수만 수정된 부분을 보여드립니다
  const handleToggleStatus = async (userNo, currentStatus) => {
    try {
      const response = await API.put(`/admin/${userNo}/user-status`)

      if (response.data.status === 'ACCEPTED') {
        setFilteredUsers((users) =>
          users.map((user) =>
            user.userNo === userNo ? { ...user, status: response.data.result } : user,
          ),
        )

        // 성공 메시지 표시
        alert('사용자 상태가 변경되었습니다.')
      } else {
        alert('상태 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('사용자 상태 변경 중 오류 발생:', error)
      // API interceptor에서 401, 403, 409 에러를 처리하므로
      // 여기서는 기타 에러만 처리합니다
      if (!error.response || ![401, 403, 409].includes(error.response.status)) {
        alert('상태 변경에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }
  const handleSelectUser = (userNo) => {
    setSelectedUsers((prev) =>
      prev.includes(userNo) ? prev.filter((id) => id !== userNo) : [...prev, userNo],
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.userNo))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) {
      alert('삭제할 회원을 선택하세요.')
      return
    }
    if (!window.confirm(`선택한 ${selectedUsers.length}명의 회원을 삭제하시겠습니까?`)) return

    try {
      for (const userNo of selectedUsers) {
        await API.delete(`/users/${userNo}`)
      }
      alert('선택한 회원이 삭제되었습니다.')
      fetchUsers()
      setSelectedUsers([])
    } catch (error) {
      console.error('회원 삭제 오류:', error)
      alert('회원 삭제에 실패했습니다.')
    }
  }

  // 페이지네이션 관련 로직
  const indexOfLastUser = currentPage * itemsPerPage
  const indexOfFirstUser = indexOfLastUser - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  return (
    <div className='p-6'>
      <Breadcrumb paths={breadcrumbPaths} />
      <h1 className='text-2xl font-bold mb-6'>회원정보관리</h1>
      <section className='mb-6'>
        <h2 className='text-lg font-semibold mb-4'>| 기본검색</h2>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-2 w-full'>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className='border border-gray-300 rounded-md px-3 py-2'
            >
              <option value='user-no'>회원번호</option>
              <option value='회원명'>회원명</option>
              <option value='이메일'>이메일</option>
            </select>
            <input
              type='text'
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className='w-64 border border-gray-300 rounded-md px-3 py-2'
              placeholder='검색어를 입력하세요'
            />
            <button onClick={handleSearch} className='bg-blue-500 text-white px-4 py-2 rounded-md'>
              조회
            </button>
          </div>
        </div>
      </section>
      {isLoading ? (
        <div className='text-center'>로딩 중...</div>
      ) : currentUsers.length > 0 ? (
        <section>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold'>| 조회 결과</h2>
            <button
              onClick={handleDeleteSelected}
              className='bg-red-500 text-white px-4 py-2 rounded-md'
            >
              선택 삭제
            </button>
          </div>

          <table className='table-auto w-full border'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='border px-4 py-2'>
                  <input
                    type='checkbox'
                    checked={selectedUsers.length === currentUsers.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className='border px-4 py-2'>회원번호</th>
                <th className='border px-4 py-2'>회원명</th>
                <th className='border px-4 py-2'>이메일</th>
                <th className='border px-4 py-2'>전화번호</th>
                <th className='border px-4 py-2'>회원 등급</th>
                <th className='border px-4 py-2'>회원 상태</th>
                <th className='border px-4 py-2'>상세페이지</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.userNo}>
                  <td className='border px-4 py-2 text-center'>
                    <input
                      type='checkbox'
                      checked={selectedUsers.includes(user.userNo)}
                      onChange={() => handleSelectUser(user.userNo)}
                    />
                  </td>
                  <td className='border px-4 py-2 text-center'>{user.userNo}</td>
                  <td className='border px-4 py-2 text-center'>{user.name}</td>
                  <td className='border px-4 py-2 text-center'>{user.email}</td>
                  <td className='border px-4 py-2 text-center'>{user.phoneNumber}</td>
                  <td className='border px-4 py-2 text-center'>{user.level}</td>
                  <td className='border px-4 py-2 text-center'>
                    <button
                      onClick={() => handleToggleStatus(user.userNo, user.status)}
                      className={`px-3 py-1 rounded ${
                        user.status === 'ACTIVE'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {user.status || 'ACTIVE'}
                    </button>
                  </td>
                  <td className='border px-4 py-2 text-center'>
                    <button
                      onClick={() => handleNavigateToDetail(user.userNo)}
                      className='bg-transparent text-blue-500 hover:text-blue-700 transition-colors p-1'
                    >
                      <Search size={20} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='flex justify-center mt-10'>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`mx-1 px-3 py-1 border ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <div className='text-center text-gray-500'>회원 정보가 없습니다.</div>
      )}
    </div>
  )
}

export default MemberInfoManagement
