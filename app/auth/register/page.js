"use client";
import React, { useState } from "react";
import { FiEye, FiEyeOff, FiX, FiArrowRight } from "react-icons/fi";
import Select from "react-select";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";
import { userService } from "@/services/userService";
import Swal from "sweetalert2";

const GENRE_OPTIONS = [
  { value: "Action", label: "Action" },
  { value: "Comedy", label: "Comedy" },
  { value: "Drama", label: "Drama" },
  { value: "Horror", label: "Horror" },
  { value: "Romance", label: "Romance" },
  { value: "Sci-Fi", label: "Sci-Fi" },
  { value: "Thriller", label: "Thriller" },
  { value: "Animation", label: "Animation" },
  { value: "Adventure", label: "Adventure" },
  { value: "Crime", label: "Crime" },
];

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: "#ffe066",
    backgroundColor: state.isFocused
      ? "#1abc9c"
      : state.isSelected
      ? "#159c86"
      : "#223a5f",
    fontWeight: state.isSelected ? "bold" : "normal",
    fontSize: 15,
    padding: 12,
    cursor: "pointer",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#223a5f",
    borderRadius: 5,
    marginTop: 4,
    zIndex: 10,
  }),
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#223a5f",
    borderRadius: 5,
    border: state.isFocused ? "2px solid #1abc9c" : "1.5px solid #1abc9c",
    color: "#fff",
    minHeight: 44,
    boxShadow: "none",
  }),
  multiValue: (provided) => ({
    ...provided,
    display: "none",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "2px 8px",
  }),
  input: (provided) => ({
    ...provided,
    color: "#fff",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#fff",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#b0b8c1",
  }),
};

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    favorite_genres: [],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRemoveGenre = (genre) => {
    setForm({
      ...form,
      favorite_genres: form.favorite_genres.filter((g) => g !== genre),
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Passwords do not match!",
      });
      return;
    }
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.favorite_genres.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Missing genres",
        text: "Please select at least one favorite genre.",
      });
      return;
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(form.password, salt);

      const userData = {
        username: form.username,
        email: form.email,
        password_hash: hashedPassword,
        favorite_genres: form.favorite_genres,
        role: "user",
        created_at: new Date(),
        updated_at: new Date(),
      };

      const response = await userService.createUser(userData);

      if (response) {
        await Swal.fire({
          icon: "success",
          title: "Registration successful!",
          text: "Please login to continue.",
        });
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        icon: "error",
        title: "Registration failed",
        text: error.message || "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md bg-[#0a1a2f] rounded-2xl shadow-xl p-6 sm:p-8 relative">
        {/* Close button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-200 mb-6">
          Register
        </h2>

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
                  role="button"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirm"
                  placeholder="Confirm your password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-10"
                />
                <span
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
                  role="button"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition flex justify-center items-center gap-2"
            >
              Next <FiArrowRight />
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Favorite Genres
              </label>
              <Select
                isMulti
                options={GENRE_OPTIONS}
                classNamePrefix="customSelect"
                styles={customStyles}
                onChange={(selected) =>
                  setForm({
                    ...form,
                    favorite_genres: selected.map((opt) => opt.value),
                  })
                }
                value={GENRE_OPTIONS.filter((opt) =>
                  form.favorite_genres.includes(opt.value)
                )}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {form.favorite_genres.map((genre) => (
                <span
                  key={genre}
                  className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm"
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => handleRemoveGenre(genre)}
                    aria-label={`Remove ${genre}`}
                    className="ml-1 hover:text-yellow-300"
                  >
                    <FiX />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex justify-between gap-3">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Register
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-600 text-white py-2.5 rounded-lg font-medium hover:bg-gray-700 transition"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
