import React, { useEffect, useState } from 'react'
import Breadcrumb from '../common/Breadcrumb'
import API from '../../../utils/API'

const SellerRegister = () => {
  const breadcrumbPaths = [{ name: 'Home' }, { name: '판매자관리' }, { name: '판매권한 승인' }]

  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('companyNo')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const response = await API.get('/admin/seller-approvals')
        console.log('📢 API 응답 데이터:', response.data.result.data)
        setApprovals(response.data.result.data)
      } catch (err) {
        console.error('판매상태 조회 실패:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchApprovals()
  }, [])

  const processCompanies = (status) => {
    return approvals
      .filter((company) =>
        status === 'pending'
          ? company.statistics.pendingCount > 0
          : company.statistics.approvedCount > 0,
      )
      .map((company) => {
        const sortedSellers = company.sellers.sort((a, b) => a.sellerNo - b.sellerNo)
        const representativeSeller = sortedSellers.find(
          (seller) => seller.approvalStatus === (status === 'pending' ? 'N' : 'Y'),
        )
        return {
          ...company,
          representativeSeller,
        }
      })
  }

  const pendingCompanies = processCompanies('pending')
  const approvedCompanies = processCompanies('approved')

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = pendingCompanies.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(pendingCompanies.length / itemsPerPage)
  const [isEmailSending, setIsEmailSending] = useState(false)

  const filteredApprovedCompanies = approvedCompanies.filter((company) => {
    if (!appliedSearchQuery) return true
    const fieldValue = String(company[searchType] || '')
      .trim()
      .toLowerCase()
    return fieldValue === appliedSearchQuery.trim().toLowerCase()
  })

  const handleApproveSeller = async (companyNo, sellerNo, companyName, representativeEmail) => {
    if (!window.confirm('해당 판매자를 승인 상태로 변경하시겠습니까?')) return

    try {
      // 1️⃣ 판매자 승인 API 호출
      const response = await API.put(`/admin/${sellerNo}/approve`)
      console.log('판매자 승인 응답:', response)
      setIsEmailSending(true) // 이메일 전송 시작

      // 2️⃣ 승인 성공 후 메일 발송 API 호출
      const mailData = {
        title: '판매자 승인 완료 안내',
        content: `안녕하세요,\n\n"${companyName}" 회사의 판매자 권한이 승인되었습니다.\n\n사이트에서 판매를 진행하실 수 있습니다.\n\n감사합니다.`,
        recipient: representativeEmail,
      }

      const mailResponse = await API.post('/sellers/mail', mailData)
      console.log('메일 발송 응답:', mailResponse)

      // 3️⃣ 상태 업데이트 (승인된 판매자 목록 업데이트)
      setApprovals((prevApprovals) =>
        prevApprovals.map((company) => {
          if (company.companyNo === companyNo) {
            return {
              ...company,
              sellers: company.sellers.map((seller) =>
                seller.sellerNo === sellerNo ? { ...seller, approvalStatus: 'Y' } : seller,
              ),
              statistics: {
                ...company.statistics,
                approvedCount: company.statistics.approvedCount + 1,
                pendingCount: company.statistics.pendingCount - 1,
              },
            }
          }
          return company
        }),
      )

      alert(`"${companyName}" 회사의 판매자 승인 및 메일 발송이 완료되었습니다.`)
    } catch (error) {
      console.error('판매자 승인 또는 메일 발송 실패:', error)
      alert('판매자 승인 또는 메일 발송에 실패했습니다.')
    } finally {
      setIsEmailSending(false) // 이메일 전송 완료
    }
  }

  const handleSearch = () => {
    console.log('🔍 검색 실행:', searchType, searchQuery)
    setAppliedSearchQuery(searchQuery)
  }
  return (
    <div className='p-6 bg-white min-h-screen'>
      <Breadcrumb paths={breadcrumbPaths} />
      <h1 className='text-2xl font-bold mb-6'>판매권한 승인</h1>

      {/* 승인 대기 목록 */}
      <div className='mb-8'>
        <h2 className='text-lg font-semibold mb-4'>| 승인 대기 회사 목록</h2>
        <table className='min-w-full border border-gray-300'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='border px-4 py-2'>회사번호</th>
              <th className='border px-4 py-2'>회사명</th>
              <th className='border px-4 py-2'>대표 이메일</th>
              <th className='border px-4 py-2'>대표 전화번호</th>
              <th className='border px-4 py-2'>회사정보</th>
              <th className='border px-4 py-2'>승인</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((company) => (
                <tr key={company.companyNo} className='hover:bg-gray-100'>
                  <td className='border px-4 py-2 text-center'>{company.companyNo}</td>
                  <td className='border px-4 py-2 text-center'>{company.companyName}</td>
                  <td className='border px-4 py-2 text-center'>
                    {company.representativeSeller?.email || '-'}
                  </td>
                  <td className='border px-4 py-2 text-center'>
                    {company.representativeSeller?.callNumber || '-'}
                  </td>
                  <td className='border px-4 py-2'>
                    <div className='text-sm'>
                      <strong>사업자등록번호</strong>: {company.license}
                      <br />
                      <strong>은행</strong>: {company.bank} | 계좌: {company.bankAccount}
                    </div>
                  </td>
                  <td className='border px-4 py-2 text-center'>
                    <button
                      onClick={() =>
                        handleApproveSeller(
                          company.companyNo,
                          company.representativeSeller?.sellerNo,
                          company.companyName,
                          company.representativeSeller?.email,
                        )
                      }
                      className={`bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 ${
                        isEmailSending ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={isEmailSending} // 버튼 비활성화
                    >
                      {isEmailSending ? '이메일 전송 중...' : '승인'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='6' className='border px-4 py-2 text-center text-gray-500'>
                  승인 대기 중인 회사가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 승인 완료 목록 */}
      <div className='mb-8'>
        <h2 className='mb-4 text-lg font-semibold'>| 승인 완료 회사 목록</h2>
        {/* ✅ 검색 필터 */}
        <div className='mb-4'>
          <div className='flex flex-col sm:flex-row sm:items-end gap-4'>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className='w-72 border rounded-md px-3 py-2'
            >
              <option value='companyNo'>회사번호</option>
              <option value='companyName'>회사명</option>
              <option value='representativeEmail'>대표 이메일</option>
              <option value='representativePhone'>대표 전화번호</option>
            </select>
            <input
              type='text'
              placeholder='검색어 입력'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className='w-80 border rounded-md px-3 py-2'
            />
            <button
              onClick={handleSearch}
              className='bg-blue-500 text-white text-sm px-4 py-3 w-24 rounded-md hover:bg-blue-600'
            >
              조회
            </button>
          </div>
        </div>
        <table className='min-w-full border border-gray-300'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='border px-4 py-2'>회사번호</th>
              <th className='border px-4 py-2'>회사명</th>
              <th className='border px-4 py-2'>대표 이메일</th>
              <th className='border px-4 py-2'>대표 전화번호</th>
              <th className='border px-4 py-2'>회사정보</th>
            </tr>
          </thead>
          <tbody>
            {filteredApprovedCompanies.length > 0 ? (
              filteredApprovedCompanies.map((company) => (
                <tr key={company.companyNo} className='hover:bg-gray-100'>
                  <td className='border px-4 py-2 text-center'>{company.companyNo}</td>
                  <td className='border px-4 py-2 text-center'>{company.companyName}</td>
                  <td className='border px-4 py-2 text-center'>
                    {company.representativeSeller?.email || '-'}
                  </td>
                  <td className='border px-4 py-2 text-center'>
                    {company.representativeSeller?.callNumber || '-'}
                  </td>
                  <td className='border px-4 py-2'>
                    <div className='text-sm'>
                      <strong>사업자등록번호</strong>: {company.license}
                      <br />
                      <strong>은행</strong>: {company.bank} | 계좌: {company.bankAccount}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='5' className='border px-4 py-2 text-center text-gray-500'>
                  해당 회사가 목록에 존재하지 않습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SellerRegister
