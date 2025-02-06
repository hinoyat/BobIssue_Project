import React, { useState, useEffect } from 'react'
import OrderPopup from './Popup/OrderPopup'
import API from '../../../utils/API'

const Orders = () => {
  const debugMode = true // 🔹 디버그 모드 설정

  const [selectedOrders, setSelectedOrders] = useState([])
  const [popupData, setPopupData] = useState(null) // 🔹 팝업 데이터 상태 추가
  const [orderDetails, setOrderDetails] = useState({})
  const [orderList, setOrderList] = useState([]) // 🔹 주문 목록
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 🔹 더미 데이터
  const dummyOrders = [
    {
      orderId: '10001',
      productName: '무선충전기',
      option: '블랙',
      quantity: 1,
      status: '결제완료',
    },
    {
      orderId: '10002',
      productName: '게이밍 키보드',
      option: '청축',
      quantity: 1,
      status: '결제완료',
    },
    {
      orderId: '10003',
      productName: '노트북 거치대',
      option: '알루미늄',
      quantity: 2,
      status: '배송중',
    },
    {
      orderId: '10004',
      productName: '무선 마우스',
      option: '화이트',
      quantity: 1,
      status: '결제완료',
    },
    {
      orderId: '10005',
      productName: '스탠드 조명',
      option: 'LED',
      quantity: 1,
      status: '배송완료',
    },
  ]

  // 🔹 API 또는 더미 데이터 가져오기
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)

      if (debugMode) {
        console.log('📢 [디버그 모드] 더미 데이터 사용 중...')
        setOrderList(dummyOrders)
        setIsLoading(false)
        return
      }

      try {
        const response = await API.get('/orders')

        if (response.data.status === 'OK') {
          setOrderList(response.data.result.data) // 🔹 실제 API 데이터
        } else {
          throw new Error(response.data.message.label)
        }
      } catch (err) {
        console.error('API 요청 실패:', err)
        setError('주문 목록을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // 주문 선택 처리
  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.includes(orderId)
        ? prevSelected.filter((id) => id !== orderId)
        : [...prevSelected, orderId],
    )
  }

  // 🔹 팝업 열기 (결제완료 상태일 때만)
  const handleOpenPopup = (order) => {
    if (order.status === '결제완료') {
      setPopupData(order)
    }
  }

  const handleClosePopup = () => {
    setPopupData(null)
  }

  return (
    <div className='p-4 w-[1100px]'>
      <h1 className='text-[32px] font-bold mb-4'>주문 관리</h1>

      {/* 🔹 로딩 중 UI */}
      {isLoading ? (
        <p>로딩 중...</p>
      ) : error ? (
        <p className='text-red-500'>{error}</p>
      ) : (
        <table
          className='border border-gray-200 text-left bg-white'
          style={{ width: '1000px', tableLayout: 'fixed' }}
        >
          <thead>
            <tr>
              <th className='p-3 w-[100px] border-b'>선택</th>
              <th className='p-3 w-[150px] border-b'>주문 번호</th>
              <th className='p-3 w-[150px] border-b'>상품명</th>
              <th className='p-3 w-[150px] border-b'>옵션/수량</th>
              <th className='p-3 w-[100px] border-b'>주문 상태</th>
            </tr>
          </thead>
          <tbody>
            {orderList.map((order) => (
              <tr key={order.orderId} className='border-b hover:bg-gray-100'>
                <td className='p-3'>
                  <input
                    type='checkbox'
                    checked={selectedOrders.includes(order.orderId)}
                    onChange={() => handleSelectOrder(order.orderId)}
                    disabled={order.status !== '결제완료'}
                    className='cursor-pointer'
                  />
                </td>
                <td className='p-3'>
                  {/* 🔹 주문 번호 클릭 시 팝업 오픈 */}
                  {order.status === '결제완료' ? (
                    <span
                      onClick={() => handleOpenPopup(order)}
                      className='text-blue-500 cursor-pointer underline'
                    >
                      {order.orderId}
                    </span>
                  ) : (
                    order.orderId
                  )}
                </td>
                <td className='p-3'>{order.productName}</td>
                <td className='p-3'>
                  {order.option} / {order.quantity}
                </td>
                <td className='p-3'>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🔹 주문 팝업 */}
      {popupData && <OrderPopup order={popupData} onClose={handleClosePopup} />}
    </div>
  )
}

export default Orders
