"use client";
import React, { useState } from "react";
import { FiEye, FiEyeOff, FiHome } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.target);
      const email = formData.get("email");
      const password = formData.get("password");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("auth-token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const redirectUrl = searchParams.get("redirect");
      const isAdmin = ["admin", "super_admin", "theater_admin"].includes(
        data.user.role
      );

      if (redirectUrl && redirectUrl.startsWith("/admin")) {
        router.push(isAdmin ? redirectUrl : "/");
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else if (data.user.role === "super_admin") {
        router.push("/admin/theater-admins");
      } else if (data.user.role === "theater_admin") {
        router.push("/admin/dashboard");
      } else if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md bg-[#0a1a2f] rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push("/")}
            aria-label="Go to homepage"
            className="text-gray-200 hover:text-gray-400 text-2xl"
          >
            <FiHome />
          </button>
          <button
            onClick={() => window.history.back()}
            aria-label="Close"
            className="text-gray-200 hover:text-gray-400 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-200 mb-6">
          Sign In
        </h2>

        {/* Redirect note */}
        {searchParams.get("redirect") && (
          <p className="text-sm text-gray-200 text-center mb-4">
            You&apos;ll be redirected to{" "}
            <span className="font-medium text-gray-400">
              {searchParams.get("redirect")}
            </span>{" "}
            after signing in
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
                role="button"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between items-center text-sm">
            <a
              href="/auth/forgot-password"
              className="text-indigo-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <a
              href="/auth/register"
              className="text-indigo-600 font-medium hover:underline"
            >
              Create one
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
