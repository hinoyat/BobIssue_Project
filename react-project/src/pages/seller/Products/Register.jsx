import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '@/utils/API'
import ProductInfo from './Form/Product/ProductInfo'
import ProductImage from './Form/Product/ProductImage'
import ProductDetails from './Form/Product/ProductDetails'
import ProductDate from './Form/Product/ProductDate'

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [debug_mode, setDebugMode] = useState(false) // ✅ 디버그 모드 추가

  const [product, setProduct] = useState({
    name: '',
    categoryNo: '',
    price: '',
    salePrice: '',
    stock: '',
    images: [],
    description: '',
    expiredAt: '',
  })

  // ✅ 로그인 확인 및 인증되지 않으면 로그인 페이지로 이동
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      alert('상품 등록을 위해 로그인해주세요.')
      navigate('/login')
    }

    // ✅ 디버그 모드 체크 (localStorage에서 불러오기)
    const storedDebugMode = localStorage.getItem('debug_mode') === 'true'
    setDebugMode(storedDebugMode)
  }, [navigate])

  // ✅ 상품 등록 요청 함수
  const handleSubmit = async (e) => {
    e.preventDefault()

    // 필수 항목 체크
    if (
      !product.name ||
      !product.categoryNo ||
      !product.price ||
      !product.salePrice ||
      !product.stock ||
      !product.expiredAt ||
      !product.description
    ) {
      alert('모든 항목을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()

      // ✅ 상품 정보 JSON을 FormData에 개별적으로 추가
      formData.append('categoryNo', product.categoryNo)
      formData.append('name', product.name)
      formData.append('price', parseFloat(product.price))
      formData.append('salePrice', parseFloat(product.salePrice))
      formData.append('stock', parseInt(product.stock, 10))
      formData.append('expiredAt', product.expiredAt)
      formData.append('description', product.description)

      // ✅ 이미지 파일 추가 (파일이 있는 경우만)
      if (product.images.length > 0) {
        product.images.forEach((img) => {
          if (img.file) {
            formData.append('images', img.file)
          }
        })
      }

      // ✅ 디버그 모드일 경우 API 호출 없이 콘솔 출력
      if (debug_mode) {
        console.log('📌 [DEBUG MODE] 상품 등록 요청 데이터:', {
          categoryNo: product.categoryNo,
          name: product.name,
          price: product.price,
          salePrice: product.salePrice,
          stock: product.stock,
          expiredAt: product.expiredAt,
          description: product.description,
          images: product.images.map((img) => img.file?.name),
        })
        setLoading(false)
        return
      }

      // ✅ FormData 디버깅 (파일 포함 확인)
      for (const pair of formData.entries()) {
        console.log(`📌 FormData 확인: ${pair[0]} →`, pair[1])
      }

      // ✅ 상품 등록 API 요청
      const response = await API.post('/item', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data.status === 'CREATED') {
        alert('✅ 상품이 성공적으로 등록되었습니다!')
        navigate('/seller/products/search')
      } else {
        alert(`❌ 상품 등록 실패: ${response.data.message.label || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('상품 저장 실패:', error)
      alert('❌ 저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='p-6'>
      <h1 className='font-bold text-[32px] mb-10'>상품 등록</h1>
      <form onSubmit={handleSubmit}>
        <ProductImage product={product} setProduct={setProduct} />
        <ProductInfo product={product} setProduct={setProduct} />
        <ProductDetails product={product} setProduct={setProduct} />
        <ProductDate product={product} setProduct={setProduct} />

        {/* ✅ 등록 버튼 */}
        <button
          type='submit'
          className={`mt-5 p-1 text-white rounded-[4px]  ${
            loading ? 'bg-amber-600 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'
          }`}
          disabled={loading}
        >
          {loading ? '등록 중...' : '상품 등록'}
        </button>
      </form>
    </div>
  )
}

export default Register
