import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { CgSpinner } from "react-icons/cg";
import { useNavigate, useSearchParams } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
  const [username, setUsername] = useState("react@test.com");
  const [password, setPassword] = useState("playful009");
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoader(true);
    setError(null);

    try {
      await login(username, password);
      setPassword("");
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      navigate(redirectTo);
    } catch (err: any) {
      setError(
        err.response?.data?.Message ||
          err.message ||
          "Login failed. Please try again."
      );
      setPassword("");
    } finally {
      setLoader(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 to-purple-900 p-4">
      <div className="relative w-full max-w-md rounded-3xl border-0 overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/background.svg')` }}
        />
        <form
          onSubmit={handleSubmit}
          className="relative z-10 backdrop-blur-md bg-white/10 border-0 rounded-2xl p-8"
          noValidate
        >
          <h1 className="text-2xl font-bold mb-6 text-center text-white">
            Login
          </h1>

          {searchParams.get("session") === "expired" && (
            <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded text-sm">
              Your session has expired. Please login again.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              placeholder="Email ID"
              className="w-full px-4 py-3 rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
              required
              autoComplete="username"
            />
          </div>

          <div className="mb-4 relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white pr-10"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="mb-6 flex justify-between items-center text-white text-sm">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="accent-white" />
              <span>Remember me</span>
            </label>
            <a href="#" className="hover:underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loader}
            className={`w-full py-3 rounded-full  font-semibold text-lg transition-all cursor-pointer hover:scale-95 duration-300 ${
              loader
                ? "bg-white/30"
                : "bg-white hover:bg-emerald-500 hover:text-white text-black"
            }`}
          >
            {loader ? (
              <span className="flex items-center justify-center gap-2">
                <CgSpinner className="animate-spin" />
                Signing in...
              </span>
            ) : (
              "Login"
            )}
          </button>
           
          <div className="mt-4 text-center text-sm text-white">
            Don’t have an account?{" "}
            <a href="#" className="underline">
              Register
            </a>
          </div>
        </form>
      </div>
    </main>
  );
};

export default LoginPage;
