import { useAuthInit } from '@/hooks/useAuth';
import AppRouter from '@/routes';

export default function App() {
  useAuthInit();
  return <AppRouter />;
}
