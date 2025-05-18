import { useRouter } from 'next/router';
import Dashboard from './dashboard';

export default function DynamicDashboard() {
  const router = useRouter();
  const { id } = router.query;
  
  // Dashboard 컴포넌트에 displayMode 속성으로 id 전달
  // id가 '0'이나 '1'에 따라 다른 모드로 표시
  return <Dashboard displayMode={id} />;
} 