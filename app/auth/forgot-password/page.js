"use client";
import React, { useState } from "react";
import styles from "../login/SignIn.module.css"; // Dùng lại style của login
import { FiEye, FiEyeOff } from "react-icons/fi";
import style from "./ForgotPassword.module.css";

export default function ForgotPassword() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    email: "",
    newPassword: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setError("Passwords do not match!");
      setSuccess("");
      return;
    }
    setError("");
    setSuccess("Password reset successfully!");
    // Xử lý gửi dữ liệu ở đây
  };

  return (
    <div className={styles.signinContainer}>
      <div className={styles.signinCard}>
        <h2 className={styles.signinTitle} style={{ width: "100%" }}>RESET PASSWORD</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
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
          <label className={styles.label}>New Password</label>
          <div className={style.passwordWrapper}>
            <input
              className={style.input}
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              placeholder="Enter new password"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
            <span
              className={style.eyeIcon}
              onClick={() => setShowNewPassword((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label="Toggle new password visibility"
            >
              {showNewPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          <label className={styles.label}>Confirm Password</label>
          <div className={style.passwordWrapper}>
            <input
              className={style.input}
              type={showConfirm ? "text" : "password"}
              name="confirm"
              placeholder="Confirm new password"
              value={form.confirm}
              onChange={handleChange}
              required
            />
            <span
              className={style.eyeIcon}
              onClick={() => setShowConfirm((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
          {success && <div style={{ color: "green", marginBottom: 8 }}>{success}</div>}
          <div className={styles.actionRow}>
            <button type="submit" className={styles.signinBtn}>
              Save
            </button>
            <a
              type="button"
              className={style.backBtn}
              onClick={() => window.history.back()}
            >
              Back
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}