import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSui } from '../../contexts/SuiContext';
import { Sun, Moon, Mail, Lock, Loader2 } from 'lucide-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import zkLoginService from '../../services/zkLoginService';
// Define logo images based on theme
const logoImages = {
    dark: '/cognilogo.png',
    light: '/logo2.png'
};
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [loading, setLoading] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [emailNotVerified, setEmailNotVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [zkLoginStatus, setZkLoginStatus] = useState('');
    const [isZkLoginLoading, setIsZkLoginLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, socialLogin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { connectWallet, isWalletConnected, wallet, isLoading: suiLoading } = useSui();
    // Check for OAuth errors and zkLogin callback on component mount
    useEffect(() => {
        console.log('Login component mounted, checking for OAuth callback...');
        console.log('Current location:', window.location.href);
        console.log('Search params:', window.location.search);
        console.log('Hash:', window.location.hash);
        // Check for id_token in query parameters
        const params = new URLSearchParams(location.search);
        let idToken = params.get('id_token');
        const oauthError = params.get('error');
        // If not found in query params, check URL fragment
        if (!idToken && window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            idToken = hashParams.get('id_token');
        }
        console.log('id_token found:', !!idToken);
        console.log('oauth_error found:', !!oauthError);
        if (oauthError === 'oauth_failed') {
            setError('OAuth login failed. Please try again or use email/password login.');
            // Clear the error from URL
            navigate('/login', { replace: true });
        }
        else if (idToken) {
            console.log('Processing zkLogin callback...');
            handleZkLoginCallback(idToken);
        }
    }, [location, navigate]);
    // Validate form when inputs change
    useEffect(() => {
        validateForm();
    }, [email, password]);
    const validateForm = () => {
        const newErrors = {};
        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        }
        else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
        }
        else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        setErrors(newErrors);
        setIsFormValid(Object.keys(newErrors).length === 0);
    };
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setTouchedFields(prev => ({ ...prev, email: true }));
    };
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setTouchedFields(prev => ({ ...prev, password: true }));
    };
    const handleBlur = (field) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
    };
    const showError = (field) => {
        return touchedFields[field] && errors[field];
    };
    // Handle traditional login with email/password
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!isFormValid)
            return;
        setLoading(true);
        setError(null);
        try {
            await login(email, password);
            navigate('/dashboard');
        }
        catch (err) {
            let errorMessage = 'Failed to login';
            if (err.response?.data?.error === 'Please verify your email before logging in') {
                errorMessage = 'Please verify your email before logging in';
                setEmailNotVerified(true);
            }
            else if (err.response?.status === 401) {
                errorMessage = 'Invalid email or password';
            }
            else if (err.message) {
                errorMessage = err.message;
            }
            setErrors(prev => ({ ...prev, general: errorMessage }));
            setError(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    // Handle zkLogin callback
    const handleZkLoginCallback = async (jwt) => {
        try {
            setZkLoginStatus('Processing ZK login...');
            setIsZkLoginLoading(true);
            // Complete zkLogin flow
            const result = await zkLoginService.handleOAuthCallback(jwt);
            // Extract email from JWT if available, otherwise use form email or generate one
            const userEmail = result.decodedJwt?.email || email || `${result.zkLoginAddress.slice(0, 8)}@zklogin.user`;
            // Send result to backend for user creation/authentication
            const response = await fetch('/api/auth/zk-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    zkLoginAddress: result.zkLoginAddress,
                    userSalt: result.userSalt,
                    jwt: jwt,
                    email: userEmail,
                    decodedJwt: result.decodedJwt
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Backend authentication failed');
            }
            const authData = await response.json();
            // Store authentication token
            localStorage.setItem('token', authData.token);
            setZkLoginStatus('Login successful!');
            // Clear the URL parameters to prevent re-processing
            window.history.replaceState({}, document.title, window.location.pathname);
            // Navigate to dashboard
            navigate('/dashboard');
        }
        catch (error) {
            console.error('OAuth callback error:', error);
            setZkLoginStatus('Login failed');
            setError('ZK login failed');
        }
        finally {
            setIsZkLoginLoading(false);
        }
    };
    // Handle social login
    const handleSocialLogin = (provider) => {
        socialLogin(provider);
    };
    // Handle zkLogin initiation
    const handleZkLogin = async () => {
        try {
            setIsZkLoginLoading(true);
            setZkLoginStatus('Starting ZK login...');
            // Get Google OAuth client ID from environment
            const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
            if (!clientId) {
                throw new Error('Google OAuth client ID not configured');
            }
            // Generate redirect URL for this page
            const redirectUrl = `${window.location.origin}/login`;
            // Start zkLogin authentication flow
            await zkLoginService.authenticateWithZkLogin(clientId, redirectUrl, (oauthUrl) => {
                // Redirect to Google OAuth
                window.location.href = oauthUrl;
            });
        }
        catch (error) {
            console.error('ZK login error:', error);
            setZkLoginStatus('Failed to start login');
            setError('Failed to start ZK login');
        }
        finally {
            setIsZkLoginLoading(false);
        }
    };
    // Handle Sui ZK login (legacy function, now handled by handleZkLogin)
    const handleSuiLogin = async () => {
        handleZkLogin();
    };
    const getFieldClass = (field) => {
        const isDark = theme === 'dark';
        const baseClass = isDark
            ? "w-full px-4 py-3 text-gray-100 bg-gray-700 bg-opacity-50 rounded-md focus:outline-none focus:ring-2"
            : "w-full px-4 py-3 text-gray-900 bg-white rounded-md focus:outline-none focus:ring-2";
        if (!touchedFields[field]) {
            return `${baseClass} focus:ring-blue-400`;
        }
        return errors[field]
            ? `${baseClass} border border-red-500 focus:ring-red-400`
            : `${baseClass} border border-green-500 focus:ring-green-400`;
    };
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src={theme === 'dark' ? logoImages.dark : logoImages.light} alt="CogniEdufy" className="h-12 w-12 mb-2"/>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mb-2">
            CogniEdufy
          </span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Welcome Back!</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Sign in to your account</p>
        </div>
        <div className="shadow-xl border-0 rounded-xl bg-white dark:bg-gray-800 relative">
          <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? (<Sun className="h-5 w-5"/>) : (<Moon className="h-5 w-5"/>)}
          </button>
          <div className="p-6">
            {error && (<div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-300">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">Authentication Failed</h3>
                    <p className="mt-1 text-sm">{error}</p>
                  </div>
                </div>
              </div>)}
            {zkLoginStatus && (<div className={`mb-4 p-4 rounded-lg border ${zkLoginStatus.includes('successful')
                ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-500/30 dark:text-green-300'
                : zkLoginStatus.includes('failed')
                    ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-300'
                    : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500/30 dark:text-blue-300'}`}>
                <div className="flex items-center space-x-2">
                  {isZkLoginLoading && <Loader2 className="h-4 w-4 animate-spin"/>}
                  <span className="text-sm">{zkLoginStatus}</span>
                </div>
              </div>)}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Mail className="h-4 w-4"/>
                  <span>Email</span>
                </label>
                <input id="email" type="email" value={email} onChange={handleEmailChange} onBlur={() => handleBlur('email')} placeholder="Enter your email" required className={getFieldClass('email')}/>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Lock className="h-4 w-4"/>
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={handlePasswordChange} onBlur={() => handleBlur('password')} placeholder="Enter your password" required className={getFieldClass('password')}/>
                  <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                    {showPassword ? <FaEyeSlash className="h-4 w-4"/> : <FaEye className="h-4 w-4"/>}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"/>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold py-3 rounded-md transition-colors" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Create one
                </Link>
              </p>
            </form>
            {/* Divider and Social Login Buttons below the form */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="mx-4 text-gray-400 dark:text-gray-500 text-sm">or</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="flex flex-col space-y-4 mb-2">
              <button onClick={() => handleSocialLogin('google')} className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600" type="button" aria-label="Login with ZK">
                Sign in with ZK
              </button>
              {/* <button
          onClick={handleSuiLogin}
          className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-sm font-medium text-white"
          type="button"
          aria-label="Login with Sui ZK"
          disabled={isZkLoginLoading}
        >
          {isZkLoginLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin text-white" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2 text-white" />
              Sign in with Sui ZK
            </>
          )}
        </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>);
};
const FeatureItem = ({ icon, title, description }) => (<li className="flex items-start">
    <div className="flex-shrink-0">
      {icon}
    </div>
    <div className="ml-3">
      <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </li>);
export default Login;
