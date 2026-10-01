import React, { useState } from 'react';
import { PageId } from '../types';
import { HeaderNav } from '../components/HeaderNav';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface CustomerAuthPageProps {
  mode: 'login' | 'register' | 'forgot-password' | 'reset-password';
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: () => void;
}

export const CustomerAuthPages: React.FC<CustomerAuthPageProps> = ({
  mode,
  onNavigate,
  onOpenOrderModal,
}) => {
  const { signIn, signUp, sendPasswordReset, updatePassword, isLoggedIn } = useCustomerAuth();

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [birthday, setBirthday] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // If already logged in and on login/register page, redirect to account
  React.useEffect(() => {
    if (isLoggedIn && (mode === 'login' || mode === 'register')) {
      onNavigate('account');
    }
  }, [isLoggedIn, mode, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await signIn({ email, password });
        if (!res.success) {
          setErrorMessage(res.error || 'Login failed. Please check your credentials.');
          setLoading(false);
          return;
        }
        setSuccessMessage('Welcome back! Redirecting to your account...');
        setTimeout(() => {
          setLoading(false);
          onNavigate('account');
        }, 600);
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match. Please re-enter.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }

        const res = await signUp({
          email,
          password,
          fullName,
          phone,
          area,
          birthday,
        });

        if (!res.success) {
          setErrorMessage(res.error || 'Registration failed.');
          setLoading(false);
          return;
        }

        setSuccessMessage('Account created successfully! Welcome to Zion Cakes & Bites.');
        setTimeout(() => {
          setLoading(false);
          onNavigate('account');
        }, 800);
      } else if (mode === 'forgot-password') {
        const res = await sendPasswordReset(email);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to send reset link.');
          setLoading(false);
          return;
        }
        setSuccessMessage('A password recovery email has been dispatched. Please check your inbox.');
        setLoading(false);
      } else if (mode === 'reset-password') {
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match.');
          setLoading(false);
          return;
        }
        const res = await updatePassword(password);
        if (!res.success) {
          setErrorMessage(res.error || 'Password update failed.');
          setLoading(false);
          return;
        }
        setSuccessMessage('Your password has been reset successfully! Redirecting to login...');
        setTimeout(() => {
          setLoading(false);
          onNavigate('login');
        }, 1200);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <section className="page-header-banner">
        <div className="page-header-card">
          <HeaderNav
            currentPage={mode}
            onNavigate={onNavigate}
            onOpenOrderModal={onOpenOrderModal}
          />
          <div className="page-title-section" style={{ textAlign: 'center', padding: '30px 20px 10px' }}>
            <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>
              ZION CUSTOMER PORTAL
            </div>
            <h1 style={{ fontSize: '32px' }}>
              {mode === 'login' && 'Sign In to Your Account'}
              {mode === 'register' && 'Create Your Customer Account'}
              {mode === 'forgot-password' && 'Reset Password'}
              {mode === 'reset-password' && 'Set New Password'}
            </h1>
            <p style={{ maxWidth: '480px', margin: '6px auto 0', color: '#cfc6b8', fontSize: '14px' }}>
              {mode === 'login' && 'Track your orders, view order status timelines, and manage delivery details.'}
              {mode === 'register' && 'Join Zion Cakes & Bites in Mbeya for faster ordering, order tracking and rewards.'}
              {mode === 'forgot-password' && 'Enter your email address and we will send you a secure link to reset your password.'}
              {mode === 'reset-password' && 'Enter your new password below.'}
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 20px 80px', flex: 1, display: 'flex', alignItems: 'center' }}>
        <div className="wrap" style={{ maxWidth: '480px', width: '100%' }}>
          <div
            style={{
              background: 'var(--card)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
            }}
          >
            {/* Mode Switcher */}
            {(mode === 'login' || mode === 'register') && (
              <div
                style={{
                  display: 'flex',
                  background: 'rgba(0,0,0,0.06)',
                  borderRadius: '12px',
                  padding: '4px',
                  marginBottom: '22px',
                  gap: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    background: mode === 'login' ? '#fff' : 'transparent',
                    fontWeight: mode === 'login' ? 700 : 500,
                    fontSize: '13.5px',
                    color: mode === 'login' ? 'var(--dark)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    background: mode === 'register' ? '#fff' : 'transparent',
                    fontWeight: mode === 'register' ? 700 : 500,
                    fontSize: '13.5px',
                    color: mode === 'register' ? 'var(--dark)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    boxShadow: mode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Alerts */}
            {errorMessage && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  marginBottom: '16px',
                  lineHeight: 1.4,
                  border: '1px solid #fecaca',
                }}
              >
                ⚠️ {errorMessage}
              </div>
            )}

            {successMessage && (
              <div
                style={{
                  background: '#dcfce7',
                  color: '#166534',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  marginBottom: '16px',
                  lineHeight: 1.4,
                  border: '1px solid #bbf7d0',
                }}
              >
                ✓ {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                      Full Name <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Anna Mwambene"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                      Phone / WhatsApp Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g., 0768 111 222"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {mode !== 'reset-password' && (
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                    Email Address <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {mode !== 'forgot-password' && (
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 600 }}>
                      Password <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => onNavigate('forgot-password')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--orange)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          padding: 0,
                          fontWeight: 600,
                        }}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              {(mode === 'register' || mode === 'reset-password') && (
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                    Confirm Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              {mode === 'register' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                      Delivery Area
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Forest, Uyole"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                      Birthday (MM-DD)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 10-14"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn-solid"
                disabled={loading}
                style={{
                  width: '100%',
                  minHeight: '48px',
                  justifyContent: 'center',
                  fontSize: '15px',
                  marginTop: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : mode === 'login' ? (
                  <span>Sign In ↗</span>
                ) : mode === 'register' ? (
                  <span>Create Account ↗</span>
                ) : mode === 'forgot-password' ? (
                  <span>Send Recovery Link</span>
                ) : (
                  <span>Set New Password</span>
                )}
              </button>
            </form>

            {/* Helper links */}
            <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              {mode === 'forgot-password' && (
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dark)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  ← Back to Sign In
                </button>
              )}

              {mode === 'login' && (
                <span>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--orange)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Sign up free
                  </button>
                </span>
              )}

              {mode === 'register' && (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--orange)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
