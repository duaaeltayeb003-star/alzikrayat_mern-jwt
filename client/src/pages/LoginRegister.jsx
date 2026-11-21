import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

const emptyRegister = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  location: '',
  occupation: '',
  description: '',
};

export default function LoginRegister() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state && location.state.from && location.state.from.pathname) || '/gallery';

  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState(emptyRegister);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const handleChange = (setter) => (e) => setter((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token, user: profile } =
        mode === 'login'
          ? await api.post('/auth/login', loginForm)
          : await api.post('/auth/register', registerForm);
      login(token, profile); // store the JWT and keep the profile in React state
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="wrap section auth">
      <div className="auth-intro">
        <h1>{isLogin ? 'Welcome back' : 'Join Alzikrayat'}</h1>
        <p className="lead">
          {isLogin
            ? 'Log in to add photos and join the conversation.'
            : 'Create an account to share your own campus moments.'}
        </p>
      </div>

      <div className="panel cut">
        <div className="tabs" role="tablist" aria-label="Account">
          <button type="button" role="tab" aria-selected={isLogin} onClick={() => switchMode('login')}>
            Log in
          </button>
          <button type="button" role="tab" aria-selected={!isLogin} onClick={() => switchMode('register')}>
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {isLogin ? (
            <>
              <div className="field">
                <label htmlFor="login-email">Email</label>
                <input id="login-email" name="email" type="email" autoComplete="email" required
                  value={loginForm.email} onChange={handleChange(setLoginForm)} />
              </div>
              <div className="field">
                <label htmlFor="login-password">Password</label>
                <input id="login-password" name="password" type="password" autoComplete="current-password" required
                  value={loginForm.password} onChange={handleChange(setLoginForm)} />
              </div>
            </>
          ) : (
            <>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="firstName">First name</label>
                  <input id="firstName" name="firstName" autoComplete="given-name" required
                    value={registerForm.firstName} onChange={handleChange(setRegisterForm)} />
                </div>
                <div className="field">
                  <label htmlFor="lastName">Last name</label>
                  <input id="lastName" name="lastName" autoComplete="family-name" required
                    value={registerForm.lastName} onChange={handleChange(setRegisterForm)} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="reg-email">Email</label>
                <input id="reg-email" name="email" type="email" autoComplete="email" required
                  value={registerForm.email} onChange={handleChange(setRegisterForm)} />
              </div>
              <div className="field">
                <label htmlFor="reg-password">Password</label>
                <input id="reg-password" name="password" type="password" autoComplete="new-password" minLength={6} required
                  value={registerForm.password} onChange={handleChange(setRegisterForm)} />
                <p className="hint">At least 6 characters.</p>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="location">Location (optional)</label>
                  <input id="location" name="location" value={registerForm.location}
                    onChange={handleChange(setRegisterForm)} />
                </div>
                <div className="field">
                  <label htmlFor="occupation">Occupation (optional)</label>
                  <input id="occupation" name="occupation" value={registerForm.occupation}
                    onChange={handleChange(setRegisterForm)} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="reg-description">About you (optional)</label>
                <textarea id="reg-description" name="description" rows="3" maxLength={500}
                  value={registerForm.description} onChange={handleChange(setRegisterForm)} />
              </div>
            </>
          )}

          {error && <p className="alert alert-error" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
