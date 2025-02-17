/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // 보라 계열 (메인 포인트)
        secondary: '#0EA5E9', // 파란 계열 (보조 색상)
        accent: '#F59E0B', // 주황 계열 (강조)
        background: '#F9FAFB', // 연한 회색 (배경)
        card: '#FFFFFF', // 카드 배경
        textPrimary: '#1F2937', // 진한 글씨색
        textSecondary: '#6B7280', // 흐린 글씨색
        silverLight: '#F8F9FA', // 가장 밝은 은색 (배경용)
        silverMedium: '#D1D5DB', // 중간 은색 (카드 배경)
        silverDark: '#A0A4A8', // 어두운 은색 (글자, 보더)
        accentSilver: '#73787D', // 강조용 (버튼, 제목)
        buttonSilver: '#B0B4B8', // 버튼 기본 색상
        buttonHover: '#8A8E92',
        iceBlue: '#D6E6F2', // 밝고 차가운 푸른빛 배경
        steelGray: '#62757F', // 강철 느낌의 그레이 (텍스트, 보더)
        deepNavy: '#1B2A41', // 깊고 차가운 네이비 블루 (배너, 강조)
        neonBlue: '#009FFD', // 선명한 파란색 (버튼, CTA)
        coolCyan: '#0A9396', // 차가운 청록색 (포인트 컬러)
        darkGraphite: '#2D3436', // 검정에 가까운 다크 그레이 (딥 UI 배경)
        frostWhite: '#E3E6E8', // 서리 낀 밝은 회색
        frozenSilver: '#BCC5D3', // 얼음 느낌의 실버 톤
        steelBlue: '#7A9E9F', // 강철 블루 톤
        deepCobalt: '#2D4F6F', // 깊고 묵직한 코발트 블루
        neonAqua: '#00C8FF', // 푸른빛이 감도는 네온 아쿠아
        graphiteBlack: '#1E252B', // 깊고 강한 블랙
        frostyCyan: '#0A95A6', // 차갑고 투명한 청록색
        darkChrome: '#5A5F63',
        richGold: '#D4AF37', // 고급스러운 황금색 (포인트)
        darkEmerald: '#006D5B', // 금융 관련 짙은 녹색
        moneyGreen: '#4CAF50', // 일반적인 지폐색 계열 (주요 배경)
        luxuryNavy: '#1F3B4D', // 금융 & 기업 이미지의 네이비
        graphiteBlack: '#1E252B', // 신뢰감을 주는 다크 그레이
        platinumSilver: '#C0C0C0', // 고급스러운 플래티넘 실버 (카드 배경)
        darkChrome: '#5A5F63', // 비즈니스 느낌의 메탈릭 다크 그레이
        neonMint: '#00FFAF',
        cobalt: {
          50: '#eef2ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // 기본 코발트 블루
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')], // 🧩 스크롤바 숨기기 플러그인 추가
}
