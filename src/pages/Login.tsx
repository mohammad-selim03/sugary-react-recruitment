// src/pages/LoginPage.tsx
import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { CgSpinner } from "react-icons/cg";

const LoginPage = () => {
  const [username, setUsername] = useState("react@test.com");
  const [password, setPassword] = useState("playful009");
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    setLoader(true)
    e.preventDefault();
    setError(null); // Clear previous error
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message);
      setLoader(false)
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
        {/* {error && <p className="text-red-600 mb-4 text-sm text-center">{error}</p>} */}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="block w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="block w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          {
            loader ? <p className="flex items-center gap-3 justify-center">Submitting... <span className="animate-spin"><CgSpinner /></span></p> : <p>Login</p>
          }
        </button>
      </form>
    </main>
  );
};

export default LoginPage;
