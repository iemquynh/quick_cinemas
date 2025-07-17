"use client";
import React, { useState, useEffect } from "react";
import styles from "./SignIn.module.css";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useRouter, useSearchParams } from 'next/navigation';

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
      const email = formData.get('email');
      const password = formData.get('password');

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Sau khi nhận response từ API login:
      localStorage.setItem('auth-token', data.token); // <-- BẮT BUỘC PHẢI CÓ DÒNG NÀY
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Lấy redirect URL từ query params
      const redirectUrl = searchParams.get('redirect');

      // Chỉ cho phép admin/super_admin/theater_admin truy cập admin
      const isAdmin = ['admin', 'super_admin', 'theater_admin'].includes(data.user.role);

      if (redirectUrl && redirectUrl.startsWith('/admin')) {
        if (isAdmin) {
          router.push(redirectUrl);
        } else {
          // Nếu không phải admin, về trang chủ hoặc trang user
          router.push('/');
        }
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else if (data.user.role === 'super_admin') {
        router.push('/admin/theater-admins');
      } else if (data.user.role === 'theater_admin') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signinContainer}>
      <div className={styles.signinCard}>
        <button onClick={() => window.history.back()} className={styles.closeBtn}>&times;</button>
        <h2 className={styles.signinTitle}>SIGN IN</h2>
        {searchParams.get('redirect') && (
          <p style={{ 
            color: '#666', 
            fontSize: '14px', 
            textAlign: 'center', 
            marginBottom: '20px' 
          }}>
            You'll be redirected to {searchParams.get('redirect')} after signing in
          </p>
        )}
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>Email</label>
          <div className={styles.passwordWrapper}>
            <input 
              className={styles.input} 
              type="email" 
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <label className={styles.label}>Password</label>
          <div className={styles.passwordWrapper}>
            <input
              className={`${styles.input} ${showPassword ? styles.inputShow : ""}`}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
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
          {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
          <a href="/auth/forgot-password" className={styles.forgotLink}>Forgot your password?</a>
          <button 
            type="submit" 
            className={styles.signinBtn}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <a href="/auth/register" className={styles.forgotLink} style={{textAlign: 'center'}}>Create a new account</a>
        </form>
      </div>
    </div>
  );
}

