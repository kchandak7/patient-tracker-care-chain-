import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const LoginPage = () => {
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // redirect will be handled by App.jsx routing logic
    } catch (err) {
      setError(
        err?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans">
      {/* Breadcrumb */}
      <div className="bg-[#e8ecf0] border-b border-[#c8d0d8] px-6 py-1 text-xs text-gray-500">
        Home &gt; <span className="text-[#0066cc]">Login</span>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
          {/* Header */}
          <div className="bg-[#1a2b4a] text-white px-6 py-4 flex items-center gap-3">
            <div className="w-7 h-7 bg-[#0066cc] rounded-sm flex items-center justify-center">
              🔒
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide">
                STAFF LOGIN
              </div>
              <div className="text-xs text-blue-300">
                MedCare Hospital Management System
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@medcare.hospital"
                className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm
                  focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]
                  bg-[#fafbfc]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-sm px-3 py-2.5 text-sm
                  focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]
                  bg-[#fafbfc]"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0066cc] hover:bg-[#0055aa]
                disabled:opacity-60 text-white font-bold text-sm tracking-widest
                rounded-sm transition-colors uppercase"
            >
              {loading ? "Authenticating..." : "Login →"}
            </button>

            <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-400">
              Don’t have an account?{" "}
              <Link to="/register" className="text-[#0066cc] font-semibold hover:underline">
                Register
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          🔐 Secure access. Unauthorized use is prohibited.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;