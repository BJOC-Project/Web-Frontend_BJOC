import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/features/shared/services";
import { setAccessToken, setUserInfo, getAccessToken } from "@/features/shared/services/secureTokenManager";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/features/shared/components";
import { usePageTitle } from "@/features/shared/hooks";

export function LoginPage() {
  usePageTitle("BJOC Login");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const accessToken = getAccessToken();
    if (accessToken) {
      navigate("/", { replace: true });
      return;
    }
    setChecking(false);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      setAccessToken(res.data.accessToken);

      setUserInfo({
        email: res.data.email,
        fullName: res.data.fullName,
        role: res.data.role,
      });

      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">

      {/* LEFT SIDE - BRAND */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-orange-500 to-orange-700 text-white relative items-center justify-center">

        {/* overlay pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/map-pattern.png')] bg-cover"></div>

        <div className="relative z-10 text-center px-12 space-y-8">

          <img
            src="/logo1.png"
            className="w-28 mx-auto"
          />

          <h1 className="text-5xl font-bold tracking-wide">
            BJOC
          </h1>

          <p className="text-lg opacity-90 leading-relaxed">
            Bicolano Jeepney Operators Corporation
          </p>

          <p className="text-sm opacity-80 max-w-md mx-auto">
            Real-Time Jeepney Tracking and Passenger Information System
          </p>

          <div className="text-xs opacity-70 pt-12">
            Modern Jeepney Transport System
          </div>
        </div>

        {/* floating blur */}
        <div className="absolute bottom-[-120px] left-[-120px] w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>

      </div>

      {/* RIGHT SIDE LOGIN */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8">

        <div className="w-full max-w-md">

          <div className="mb-10 text-center lg:text-left">

            <h2 className="text-4xl font-bold text-orange-600">
              Login
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              Access the BJOC Management System
            </p>

          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* EMAIL */}
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full border-b border-gray-300 py-3 outline-none focus:border-orange-500 transition"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full border-b border-gray-300 py-3 outline-none focus:border-orange-500 transition pr-10"
              />

              <button
                type="button"
                className="absolute right-2 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

            </div>

            {/* REMEMBER */}
            <div className="flex items-center gap-2 text-sm">

              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 accent-orange-500"
              />

              <label htmlFor="remember" className="cursor-pointer">
                Remember me
              </label>

            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

          </form>

          <p className="mt-8 text-xs text-gray-400 italic text-center lg:text-left">
            *Do not share your BJOC system credentials.
          </p>

        </div>

      </div>

    </div>
  );
}