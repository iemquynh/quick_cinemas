"use client";
import React, { useState } from "react";
import styles from "./Register.module.css";
import { FiEye, FiEyeOff, FiX, FiArrowRight } from "react-icons/fi";
import Select from "react-select";
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { userService } from '@/services/userService';

const GENRE_OPTIONS = [
  { value: "Action", label: "Action" },
  { value: "Comedy", label: "Comedy" },
  { value: "Drama", label: "Drama" },
  { value: "Horror", label: "Horror" },
  { value: "Romance", label: "Romance" },
  { value: "Sci-Fi", label: "Sci-Fi" },
  { value: "Thriller", label: "Thriller" },
  { value: "Animation", label: "Animation" },
  { value: "Adventure", label: "Adventure" }
];

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    color: "#ffe066", // Màu vàng nổi bật
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
    display: "none", // Ẩn tag genre đã chọn trên thanh select
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
  const [error, setError] = useState("");

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
    // Validate password match
    if (form.password !== form.confirm) {
      setError("Passwords do not match!");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.favorite_genres.length === 0) {
      setError("Please select at least one favorite genre.");
      return;
    }
    setError("");

    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(form.password, salt);

      // Create user data
      const userData = {
        username: form.username,
        email: form.email,
        password_hash: hashedPassword,
        favorite_genres: form.favorite_genres,
        role: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      console.log('Sending registration data:', userData);

      // Gọi service để tạo user
      const response = await userService.createUser(userData);
      console.log('Registration response:', response);

      if (response) {
        alert('Registration successful! Please login.');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <button onClick={() => window.history.back()} className={styles.closeBtn}>&times;</button>
        <h2 className={styles.registerTitle}>REGISTER</h2>
        {step === 1 && (
          <form className={styles.form} onSubmit={handleNext}>
            <label className={styles.label}>Username</label>
            <div className={styles.passwordWrapper}>
            <input
              className={styles.input}
              type="text"
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
            />
            </div>
            <label className={styles.label}>Email</label>
            <div className={styles.passwordWrapper}>
              <input
                className={styles.input}
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.passwordWrapper}>
              <input
                className={styles.input}
                type={showConfirm ? "text" : "password"}
                name="confirm"
                placeholder="Confirm your password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowConfirm((prev) => !prev)}
                tabIndex={0}
                role="button"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
            {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
            <button type="submit" className={styles.nextIconBtn} aria-label="Next">
              <FiArrowRight />
            </button>
          </form>
        )}
        {step === 2 && (
          <form className={styles.form1} onSubmit={handleRegister}>
            <label className={styles.label}>Favorite Genres</label>
            <Select
              isMulti
              options={GENRE_OPTIONS}
              classNamePrefix="customSelect"
              styles={customStyles}
              onChange={selected => {
                setForm({ ...form, favorite_genres: selected.map(opt => opt.value) });
              }}
              value={GENRE_OPTIONS.filter(opt => form.favorite_genres.includes(opt.value))}
            />
            <div className={styles.selectedGenres}>
              {form.favorite_genres.map((genre) => (
                <span className={styles.genreTag} key={genre}>
                  {genre}
                  <button
                    type="button"
                    className={styles.genreRemove}
                    onClick={() => handleRemoveGenre(genre)}
                    aria-label={`Remove ${genre}`}
                  >
                    <FiX />
                  </button>
                </span>
              ))}
            </div>
            {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
            <div className={styles.actionRow}>
              <button type="submit" className={styles.registerBtn}>
                Register
              </button>
              <button
                type="button"
                className={styles.backBtn}
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