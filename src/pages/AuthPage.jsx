import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, resetPassword, user, supabase } = useAuth();

  const isResetMode = searchParams.get('reset') === 'true';
  const isRecoveryMode = searchParams.get('type') === 'recovery';

  const [mode, setMode] = useState(() => {
    if (isResetMode || isRecoveryMode) return 'reset';
    return 'signin';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isResetMode || isRecoveryMode) {
      setMode('reset');
      setMessage('Enter your new password.');
    }
  }, [isResetMode, isRecoveryMode]);

  const handleHashFragment = async () => {
    const hash = window.location.hash;
    if (!hash) return;

    try {
      if (hash.includes('type=recovery') || hash.includes('type=signup')) {
        const params = new URLSearchParams(hash.replace('#', ''));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (accessToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          window.location.hash = '';

          if (type === 'recovery') {
            setMode('reset');
            setMessage('Enter your new password.');
          } else if (type === 'signup') {
            setMessage('Email verified! You can now sign in.');
            setMode('signin');
          }
        }
      }
    } catch (err) {
      console.error('Auth callback error:', err);
    }
  };

  useEffect(() => {
    handleHashFragment();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'reset') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const { error } = await supabase.auth.updateUser({ password });
          if (error) {
            setError(error.message);
          } else {
            setMessage('Password updated successfully. Sign in with your new password.');
            setMode('signin');
            setPassword('');
            setConfirmPassword('');
          }
        } else {
          const hash = window.location.hash;
          const params = new URLSearchParams(hash.replace('#', ''));
          const accessToken = params.get('access_token');

          if (accessToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: params.get('refresh_token') || '',
            });
            const { error } = await supabase.auth.updateUser({ password });
            if (error) {
              setError(error.message);
            } else {
              setMessage('Password updated successfully. Sign in with your new password.');
              setMode('signin');
              setPassword('');
              setConfirmPassword('');
            }
          } else {
            setError('Invalid reset link. Please request a new one.');
          }
        }
        setLoading(false);
        return;
      }

      if (mode === 'signin') {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error.message);
        } else {
          navigate('/', { replace: true });
        }
      } else if (mode === 'signup') {
        const result = await signUp(email, password);
        if (result.error) {
          setError(result.error.message);
        } else {
          setMessage('Check your email for the confirmation link.');
        }
      } else if (mode === 'forgot') {
        const result = await resetPassword(email);
        if (result.error) {
          setError(result.error.message);
        } else {
          setMessage('Check your email for the password reset link.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-surface-dark p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">AI Assistant</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {mode === 'signin' && 'Welcome back! Sign in to continue.'}
            {mode === 'signup' && 'Create an account to get started.'}
            {mode === 'forgot' && 'Reset your password.'}
            {mode === 'reset' && 'Set a new password.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required={mode !== 'reset'}
                disabled={mode === 'reset'}
              />
            </div>
          )}

          {(mode === 'signin' || mode === 'signup' || mode === 'reset') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {mode === 'reset' ? 'New Password' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          {mode === 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              mode === 'signin' ? 'Sign In' :
              mode === 'signup' ? 'Sign Up' :
              mode === 'forgot' ? 'Send Reset Link' :
              'Update Password'
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => switchMode('signup')}
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Don&apos;t have an account? Sign Up
              </button>
              <button
                onClick={() => switchMode('forgot')}
                className="text-gray-500 dark:text-gray-400 hover:underline"
              >
                Forgot password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button
              onClick={() => switchMode('signin')}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Already have an account? Sign In
            </button>
          )}
          {mode === 'reset' && (
            <button
              onClick={() => switchMode('signin')}
              className="text-gray-500 dark:text-gray-400 hover:underline"
            >
              Back to Sign In
            </button>
          )}
          {(mode === 'forgot') && (
            <button
              onClick={() => switchMode('signin')}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
