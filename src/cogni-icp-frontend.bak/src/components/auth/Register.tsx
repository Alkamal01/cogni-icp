import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSui } from '../../contexts/SuiContext';
import { Sun, Moon, CreditCard, Loader2 } from 'lucide-react';
import zkLoginService from '../../services/zkLoginService';

// Define logo images based on theme
const logoImages = {
  dark: '/cognilogo.png',
  light: '/logo2.png'
};

interface ValidationErrors {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  general?: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [emailAlreadyRegistered, setEmailAlreadyRegistered] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [isZkLoginLoading, setIsZkLoginLoading] = useState(false);
  const [zkLoginStatus, setZkLoginStatus] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();
  const { register, socialLogin, resendVerification } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { connectWallet, isWalletConnected, wallet, isLoading: suiLoading } = useSui();

  useEffect(() => {
    validateForm();
  }, [formData]);

  useEffect(() => {
    console.log('Register component mounted, checking for OAuth callback...');
    console.log('Current location:', window.location.href);
    console.log('Search params:', window.location.search);
    console.log('Hash:', window.location.hash);
    
    // Check for id_token in query parameters
    const params = new URLSearchParams(location.search);
    let idToken = params.get('id_token');
    
    // If not found in query params, check URL fragment
    if (!idToken && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      idToken = hashParams.get('id_token');
    }
    
    console.log('id_token found:', !!idToken);
    
    if (idToken) {
      console.log('Processing zkLogin callback...');
      localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\nOAuth callback detected at: ' + new Date().toISOString());
      localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\nid_token found: true');
      handleZkLoginCallback(idToken);
    } else {
      // Clear any old session storage if we're not in a callback
      console.log('No OAuth callback detected, clearing old session storage...');
      localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\nNo OAuth callback, clearing session storage at: ' + new Date().toISOString());
      sessionStorage.removeItem('zkLogin_ephemeralKeyPair');
      sessionStorage.removeItem('zkLogin_maxEpoch');
      sessionStorage.removeItem('zkLogin_randomness');
      sessionStorage.removeItem('zkLogin_nonce');
    }
  }, [location]);

  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    const passwordHasLowercase = /[a-z]/.test(formData.password);
    const passwordHasUppercase = /[A-Z]/.test(formData.password);
    const passwordHasNumber = /[0-9]/.test(formData.password);
    const passwordHasSpecialChar = /[!@#$%^&*]/.test(formData.password);
    const passwordIsMinLength = formData.password.length >= 8;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordIsMinLength || !passwordHasLowercase || !passwordHasUppercase || !passwordHasNumber || !passwordHasSpecialChar) {
      newErrors.password = 'Password must meet all requirements';
    }
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let fieldName = id;
    if (id === 'first-name') fieldName = 'first_name';
    if (id === 'last-name') fieldName = 'last_name';
    if (id === 'confirm-password') fieldName = 'confirm_password';
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    if (fieldName === 'email') {
      setEmailAlreadyRegistered(false);
    }
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id } = e.target;
    let fieldName = id;
    if (id === 'first-name') fieldName = 'first_name';
    if (id === 'last-name') fieldName = 'last_name';
    if (id === 'confirm-password') fieldName = 'confirm_password';
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const showError = (fieldName: keyof ValidationErrors) => {
    return touchedFields[fieldName] && errors[fieldName];
  };

  const handleResendVerification = async () => {
    try {
      setResendingVerification(true);
      const message = await resendVerification(formData.email);
      setErrors(prev => ({ ...prev, general: message }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to resend verification email. Please try again.';
      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(formData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    setTouchedFields(allTouched);
    validateForm();
    if (isFormValid) {
      setLoading(true);
      try {
        await register(formData);
        navigate('/registration-success');
      } catch (err: any) {
        if (err.response?.data?.error === 'Email already registered') {
          setEmailAlreadyRegistered(true);
          setErrors(prev => ({ 
            ...prev, 
            general: 'This email is already registered. Please verify your email or try logging in.' 
          }));
        } else {
          const errorMessage = err.response?.data?.error || 'An error occurred during registration.';
          setErrors(prev => ({ ...prev, general: errorMessage }));
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSocialSignUp = (provider: string) => {
    socialLogin(provider);
  };

  // Handle zkLogin callback
  const handleZkLoginCallback = async (jwt: string) => {
    try {
      console.log('Starting zkLogin callback...');
      setZkLoginStatus('Processing ZK login...');
      setIsZkLoginLoading(true);
      
      const result = await zkLoginService.handleOAuthCallback(jwt);
      console.log('zkLogin result:', result);
      
      // Extract email from JWT if available, otherwise use form email or generate one
      const email = (result.decodedJwt as any)?.email || formData.email || `${result.zkLoginAddress.slice(0, 8)}@zklogin.user`;
      console.log('Using email:', email);
      
      const requestBody = {
        zkLoginAddress: result.zkLoginAddress,
        userSalt: result.userSalt,
        jwt: jwt,
        email: email,
        decodedJwt: result.decodedJwt
      };
      console.log('Sending request to backend:', requestBody);
      
      const response = await fetch('/api/auth/zk-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Backend response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.error || 'Backend authentication failed');
      }
      
      const authData = await response.json();
      console.log('Backend auth data:', authData);

      // Store authentication token
      localStorage.setItem('token', authData.token);
      setZkLoginStatus('Registration successful!');
      
      // Clear the URL parameters to prevent re-processing
      window.history.replaceState({}, document.title, window.location.pathname);
      
      console.log('Navigating to dashboard...');
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('OAuth callback error:', error);
      setZkLoginStatus('Registration failed');
      setErrors({ general: error instanceof Error ? error.message : 'ZK login failed' });
    } finally {
      setIsZkLoginLoading(false);
    }
  };

  // Handle zkLogin initiation (only for Sui ZK button)
  const handleZkLogin = async () => {
    try {
      console.log('=== ZK LOGIN BUTTON CLICKED ===');
      localStorage.setItem('zkLogin_debug', 'Button clicked at: ' + new Date().toISOString());
      
      console.log('Starting zkLogin flow...');
      setIsZkLoginLoading(true);
      setZkLoginStatus('Starting ZK login...');
      
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      console.log('Google Client ID:', clientId ? 'Configured' : 'Not configured');
      
      if (!clientId) throw new Error('Google OAuth client ID not configured');
      
      const redirectUrl = `${window.location.origin}/register`;
      console.log('Redirect URL:', redirectUrl);
      
      console.log('Calling zkLoginService.authenticateWithZkLogin...');
      localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\nCalling authenticateWithZkLogin at: ' + new Date().toISOString());
      
      await zkLoginService.authenticateWithZkLogin(clientId, redirectUrl, (oauthUrl: string) => {
        console.log('Redirecting to OAuth URL:', oauthUrl);
        localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\nRedirecting to OAuth at: ' + new Date().toISOString());
        window.location.href = oauthUrl;
      });
    } catch (error) {
      console.error('ZK login error:', error);
      localStorage.setItem('zkLogin_debug', localStorage.getItem('zkLogin_debug') + '\nError: ' + error);
      setZkLoginStatus('Failed to start login');
      setErrors({ general: 'Failed to start ZK login' });
    } finally {
      setIsZkLoginLoading(false);
    }
  };

  // This function now just calls handleZkLogin for the Sui ZK button
  const handleSuiLogin = async () => {
    console.log('=== SUI LOGIN BUTTON CLICKED ===');
    localStorage.setItem('zkLogin_debug', '=== SUI LOGIN BUTTON CLICKED === at: ' + new Date().toISOString());
    handleZkLogin();
  };
  
  // Debug function to check the debug log
  const checkDebugLog = () => {
    const debugLog = localStorage.getItem('zkLogin_debug');
    console.log('=== DEBUG LOG ===');
    console.log(debugLog);
    alert('Debug log:\n' + debugLog);
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'At least one lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'At least one number', met: /[0-9]/.test(formData.password) },
    { label: 'At least one special character', met: /[!@#$%^&*]/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <img src={theme === 'dark' ? logoImages.dark : logoImages.light} alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              CogniEdufy
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Join CogniEdufy to start your journey</p>
        </div>
        <div className="shadow-xl border-0 rounded-xl bg-white dark:bg-gray-800 relative">
          <div className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first_name" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span>First Name</span>
                  </label>
                  <input
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter your first name"
                    required
                    className={`w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${showError('first_name') ? 'border border-red-500 focus:ring-red-400' : 'border border-gray-300 dark:border-gray-600 focus:ring-blue-400'}`}
                  />
                  {showError('first_name') && (
                    <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="last_name" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span>Last Name</span>
                  </label>
                  <input
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter your last name"
                    required
                    className={`w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${showError('last_name') ? 'border border-red-500 focus:ring-red-400' : 'border border-gray-300 dark:border-gray-600 focus:ring-blue-400'}`}
                  />
                  {showError('last_name') && (
                    <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="username" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span>Username</span>
                </label>
                <input
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Choose a username"
                  required
                  className={`w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${showError('username') ? 'border border-red-500 focus:ring-red-400' : 'border border-gray-300 dark:border-gray-600 focus:ring-blue-400'}`}
                />
                {showError('username') && (
                  <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span>Email</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  required
                  className={`w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${showError('email') || emailAlreadyRegistered ? 'border border-red-500 focus:ring-red-400' : 'border border-gray-300 dark:border-gray-600 focus:ring-blue-400'}`}
                />
                {showError('email') && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Create a strong password"
                    required
                    className={`w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${showError('password') ? 'border border-red-500 focus:ring-red-400' : 'border border-gray-300 dark:border-gray-600 focus:ring-blue-400'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {showError('password') && (
                  <div className="mt-1 space-y-1">
                    {formData.password.length < 8 && (
                      <p className="text-sm text-red-500">Password must be at least 8 characters.</p>
                    )}
                    {!/[a-z]/.test(formData.password) && (
                      <p className="text-sm text-red-500">Password must include at least one lowercase letter.</p>
                    )}
                    {!/[A-Z]/.test(formData.password) && (
                      <p className="text-sm text-red-500">Password must include at least one uppercase letter.</p>
                    )}
                    {!/[0-9]/.test(formData.password) && (
                      <p className="text-sm text-red-500">Password must include at least one number.</p>
                    )}
                    {!/[!@#$%^&*]/.test(formData.password) && (
                      <p className="text-sm text-red-500">Password must include at least one special character (!@#$%^&*).</p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm_password" className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span>Confirm Password</span>
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Confirm your password"
                    required
                    className={`w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${showError('confirm_password') ? 'border border-red-500 focus:ring-red-400' : 'border border-gray-300 dark:border-gray-600 focus:ring-blue-400'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {showError('confirm_password') && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirm_password}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold py-3 rounded-md transition-colors"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="mx-4 text-sm text-gray-400 dark:text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="flex justify-center gap-4 mb-2">
                <button
                  onClick={() => handleSocialSignUp('google')}
                  type="button"
                  className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Sign up with ZK
                </button>
                <button
                  onClick={handleSuiLogin}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 transition-colors shadow"
                  type="button"
                  aria-label="Register with Sui ZK"
                  disabled={isZkLoginLoading}
                >
                  {isZkLoginLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <CreditCard className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
              {zkLoginStatus && (
                <div className="mt-2 p-2 text-center text-sm">
                  {isZkLoginLoading && <Loader2 className="h-4 w-4 animate-spin inline mr-2" />}
                  <span className={zkLoginStatus.includes('successful') ? 'text-green-600' : zkLoginStatus.includes('failed') ? 'text-red-600' : 'text-blue-600'}>
                    {zkLoginStatus}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={checkDebugLog}
                className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Check Debug Log
              </button>
              {/* <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span className="mr-4">Google</span>
                <span>Sui ZK Login</span>
              </div> */}
              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Log in
                </Link>
              </p>
            </form>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm mt-4">
                {errors.general}
                {emailAlreadyRegistered && (
                  <div className="mt-1">
                    <button
                      className="underline font-medium text-blue-500 hover:text-blue-700"
                      onClick={handleResendVerification}
                      disabled={resendingVerification}
                    >
                      {resendingVerification ? 'Sending...' : 'Resend verification email'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PasswordRequirement: React.FC<{ text: string; satisfied: boolean }> = ({ text, satisfied }) => (
  <div className={`flex items-center text-sm ${satisfied ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
    {satisfied ? <FaCheck className="mr-2" /> : <FaTimes className="mr-2" />}
    <span>{text}</span>
  </div>
);

export default Register; 