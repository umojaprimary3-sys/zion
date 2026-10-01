import React, { useState } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { PageId } from '../types';

export interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot-password' | 'reset-password';
  onSuccess?: () => void;
  onNavigate?: (page: PageId) => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
  onNavigate,
}) => {
  const { signIn, signUp, sendPasswordReset, updatePassword } = useCustomerAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>(initialMode);
  
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

  if (!isOpen) return null;

  const handleResetForm = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(false);
  };

  const handleSwitchMode = (newMode: 'login' | 'register' | 'forgot-password') => {
    handleResetForm();
    setMode(newMode);
  };

  // Submit Handler
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
        setSuccessMessage('Welcome back! Logging you in...');
        setTimeout(() => {
          setLoading(false);
          onClose();
          if (onSuccess) onSuccess();
          if (onNavigate) onNavigate('account');
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
          onClose();
          if (onSuccess) onSuccess();
          if (onNavigate) onNavigate('account');
        }, 800);
      } else if (mode === 'forgot-password') {
        const res = await sendPasswordReset(email);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to send reset link.');
          setLoading(false);
          return;
        }
        setSuccessMessage('Password reset link sent to your email. Please check your inbox.');
        setLoading(false);
      } else if (mode === 'reset-password') {
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
        const res = await updatePassword(password);
        if (!res.success) {
          setErrorMessage(res.error || 'Password update failed.');
          setLoading(false);
          return;
        }
        setSuccessMessage('Your password has been reset successfully! You can now log in.');
        setTimeout(() => {
          setLoading(false);
          setMode('login');
        }, 1200);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div
      className="mobile-nav-drawer-overlay"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: '24px',
          maxWidth: '480px',
          width: '100%',
          padding: '30px',
          color: 'var(--text-dark)',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '4px' }}>
              Zion Cakes & Bites Customer
            </div>
            <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '24px', lineHeight: 1.2 }}>
              {mode === 'login' && 'Sign In to Your Account'}
              {mode === 'register' && 'Create Customer Account'}
              {mode === 'forgot-password' && 'Reset Your Password'}
              {mode === 'reset-password' && 'Enter New Password'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {mode === 'login' && 'Access your order history, delivery details, and favorites.'}
              {mode === 'register' && 'Join Zion loyalty, track your custom cakes, and speed up orders.'}
              {mode === 'forgot-password' && 'Enter your email address to receive a secure recovery link.'}
              {mode === 'reset-password' && 'Create a fresh password for your Zion customer account.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(36,28,21,0.08)',
              border: 'none',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        {(mode === 'login' || mode === 'register') && (
          <div
            style={{
              display: 'flex',
              background: 'rgba(0,0,0,0.06)',
              borderRadius: '12px',
              padding: '4px',
              marginBottom: '20px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '9px',
                border: 'none',
                background: mode === 'login' ? '#fff' : 'transparent',
                fontWeight: mode === 'login' ? 600 : 500,
                fontSize: '13.5px',
                color: mode === 'login' ? 'var(--dark)' : 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '9px',
                border: 'none',
                background: mode === 'register' ? '#fff' : 'transparent',
                fontWeight: mode === 'register' ? 600 : 500,
                fontSize: '13.5px',
                color: mode === 'register' ? 'var(--dark)' : 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
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

        {/* Form */}
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
                  Phone Number <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g., 0768 111 222"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                  Used for delivery coordination and WhatsApp status updates
                </span>
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
                    onClick={() => handleSwitchMode('forgot-password')}
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
                  Neighborhood / Area
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
              minHeight: '46px',
              justifyContent: 'center',
              fontSize: '15px',
              marginTop: '8px',
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

        {/* Footer helper links */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-muted)' }}>
          {mode === 'forgot-password' && (
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
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
                onClick={() => handleSwitchMode('register')}
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
                onClick={() => handleSwitchMode('login')}
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
  );
};
