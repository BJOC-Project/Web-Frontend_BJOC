// src/features/auth/pages/LoginPage.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/features/shared/services";
import {
  setAccessToken,
  setUserInfo,
  getAccessToken,
} from "@/features/shared/services/secureTokenManager";
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

  const fillDemo = (email: string, password: string) => {
    setFormData({
      email,
      password,
    });
  };

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

      // save token
      setAccessToken(res.token);

      // save user info
      setUserInfo({
        email: formData.email,
        fullName: res.user.name,
        role: res.user.role,
      });

      // role-based redirect
      if (res.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      }

      if (res.user.role === "operator") {
        navigate("/operator/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4 font-sans">

      {/* MAIN CARD */}
      <div className="w-full max-w-6xl min-h-[620px] flex flex-col md:flex-row bg-white rounded-[30px] shadow-2xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="relative w-full md:w-1/2 bg-gradient-to-br from-[#3EB076] to-[#104027] flex flex-col items-center justify-center text-white p-12">

          <div className="absolute top-0 right-0 h-full w-24 translate-x-1/2 hidden md:block">
            <svg
              viewBox="0 0 100 800"
              className="h-full w-full fill-white"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0 
                C40,60 40,120 0,180
                C40,240 40,300 0,360
                C40,420 40,480 0,540
                C40,600 40,660 0,720
                C40,780 40,800 0,800
                L100,800 L100,0 Z"
              />
            </svg>
          </div>

          <div className="text-center space-y-6 z-10">

            <p className="text-xl opacity-90">Welcome to</p>

            <div className="flex flex-col items-center gap-3">

              <div className="bg-white rounded-full shadow-lg">
                <img
                  src="/logo1.png"
                  className="size-20 object-contain"
                />
              </div>

              <h1 className="text-5xl font-bold tracking-wide">
                BJOC
              </h1>

            </div>

            <div className="mt-10 text-sm md:text-base opacity-90 leading-relaxed">
              <p>Bicolano Jeepney Operators Corporation</p>
              <p>Real-Time Jeepney Tracking and Passenger Information System</p>
            </div>

          </div>

          <div className="absolute bottom-6 text-xs opacity-70">
            Developed by <span className="font-semibold">Karl Diether Ortega</span>
          </div>

          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 lg:px-20 py-12 relative">

          <div className="mb-10">

            <h2 className="text-4xl font-bold text-[#1F8450] mb-2">
              Log in
            </h2>

            <p className="text-gray-400 text-sm">
              Access the BJOC Management System
            </p>

          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full py-3 px-2 border-b border-gray-300 focus:border-orange-500 outline-none transition text-gray-700 bg-transparent placeholder-gray-400"
              required
            />

            {/* PASSWORD */}
            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full py-3 px-2 border-b border-gray-300 focus:border-orange-500 outline-none transition text-gray-700 bg-transparent placeholder-gray-400 pr-10"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>

            </div>

            {/* REMEMBER */}
            <div className="flex items-center gap-2">

              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 accent-[#1F8450]"
              />

              <label
                htmlFor="remember"
                className="text-sm text-[#1F8450] font-medium cursor-pointer"
              >
                Remember Me
              </label>

            </div>

            <Button
              type="submit"
              disabled={loading}
              className="px-20"
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>

          </form>

          <p className="mt-8 text-xs text-gray-400 italic">
            *Do not share your BJOC system credentials with anyone.
          </p>
          <div className="flex gap-4 mt-6">

            <button
              type="button"
              onClick={() => fillDemo("admin@bjoc.com", "admin123")}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Demo Admin
            </button>

            <button
              type="button"
              onClick={() => fillDemo("operator@bjoc.com", "operator123")}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Demo Operator
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}