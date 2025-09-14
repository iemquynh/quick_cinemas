"use client";
import React, { useState } from "react";
import { FiEye, FiEyeOff, FiHome } from "react-icons/fi";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    email: "",
    newPassword: "",
    confirm: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (form.newPassword !== form.confirm) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Passwords do not match!",
        timer: 2500,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
      });
      return;
    }
  
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          newPassword: form.newPassword,
          confirm: form.confirm,
        }),
      });
  
      const data = await res.json();
  
      if (!data.success) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Reset password failed",
          timer: 2500,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
        });
        return;
      }
  
      Swal.fire({
        icon: "success",
        title: "Password reset successfully!",
        timer: 2000,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
      });
  
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong!",
        timer: 2500,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
      });
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md bg-[#0a1a2f] rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
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
            className="text-gray-200 hover:text-gray-400 text-3xl"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-200 mb-6">
          RESET PASSWORD
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* New password */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 outline-none pr-10"
              />
              <span
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer text-lg"
              >
                {showNewPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirm"
                placeholder="Confirm new password"
                value={form.confirm}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 focus:border-indigo-500 outline-none pr-10"
              />
              <span
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer text-lg"
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 border border-gray-300 text-gray-300 hover:bg-gray-700 font-semibold py-2 rounded-lg transition"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
