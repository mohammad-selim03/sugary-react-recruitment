import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

export default function Login() {
  const [username, setUsername] = useState('react@test.com');
  const [password, setPassword] = useState('playful009');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-sm mx-auto">
      <input value={username} onChange={e => setUsername(e.target.value)} className="block mb-2 w-full p-2 border" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="block mb-4 w-full p-2 border" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
    </form>
  );
}