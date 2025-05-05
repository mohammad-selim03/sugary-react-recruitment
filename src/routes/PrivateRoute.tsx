import { useAuth } from '../auth/AuthProvider';
import { Navigate } from 'react-router';

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}