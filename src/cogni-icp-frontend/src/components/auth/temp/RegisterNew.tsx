import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useSui } from '../../../contexts/SuiContext';
import { CreditCard, Loader2 } from 'lucide-react';
import zkLoginService from '../../../services/zkLoginService';
import logo from '../../../cognilogo.png';

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
  const [isZkLoginLoading, setIsZkLoginLoading] = useState(false);
  const [zkLoginStatus, setZkLoginStatus] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { connectWallet, isWalletConnected, wallet, isLoading: suiLoading } = useSui();

  // Validate form when form data changes
  useEffect(() => {
    validateForm();
  }, [formData]);

  useEffect(() => {
    console.log('RegisterNew component mounted, checking for OAuth callback...');
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
      handleZkLoginCallback(idToken);
    }
  }, [location]);
  
  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    
    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }
    
    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
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
    
    // Confirm password validation
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
    
    // Map the HTML IDs to the form data field names
    if (id === 'first-name') fieldName = 'first_name';
    if (id === 'last-name') fieldName = 'last_name';
    if (id === 'confirm-password') fieldName = 'confirm_password';
    
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Mark field as touched when user types
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id } = e.target;
    let fieldName = id;
    
    // Map the HTML IDs to the form data field names
    if (id === 'first-name') fieldName = 'first_name';
    if (id === 'last-name') fieldName = 'last_name';
    if (id === 'confirm-password') fieldName = 'confirm_password';
    
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const showError = (fieldName: keyof ValidationErrors) => {
    return touchedFields[fieldName] && errors[fieldName];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    
    setTouchedFields(allTouched);
    
    // Run validation
    validateForm();
    
    if (isFormValid) {
      setLoading(true);
      try {
        await login();
        navigate('/registration-success');
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'An error occurred during registration.';
        setErrors(prev => ({ ...prev, general: errorMessage }));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSocialSignUp = (provider: string) => {
    // This function is no longer needed as social login is handled by the login context
    // Keeping it for now, but it will be removed if not used elsewhere.
    console.warn("Social sign-up is not directly supported in this component. Use the login page.");
  };

  // Handle zkLogin callback
  const handleZkLoginCallback = async (jwt: string) => {
    try {
      setZkLoginStatus('Processing ZK login...');
      setIsZkLoginLoading(true);
      const result = await zkLoginService.handleOAuthCallback(jwt);
      
      // Extract email from JWT if available, otherwise use form email or generate one
      const email = (result.decodedJwt as any)?.email || formData.email || `${result.zkLoginAddress.slice(0, 8)}@zklogin.user`;
      
      const response = await fetch('/api/auth/zk-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zkLoginAddress: result.zkLoginAddress,
          userSalt: result.userSalt,
          jwt: jwt,
          email: email,
          decodedJwt: result.decodedJwt
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backend authentication failed');
      }
      
      const authData = await response.json();
      localStorage.setItem('token', authData.token);
      setZkLoginStatus('Registration successful!');
      
      // Clear the URL parameters to prevent re-processing
      window.history.replaceState({}, document.title, window.location.pathname);
      
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
      setIsZkLoginLoading(true);
      setZkLoginStatus('Starting ZK login...');
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      if (!clientId) throw new Error('Google OAuth client ID not configured');
      const redirectUrl = `${window.location.origin}/register`;
      await zkLoginService.authenticateWithZkLogin(clientId, redirectUrl, (oauthUrl: string) => {
        window.location.href = oauthUrl;
      });
    } catch (error) {
      console.error('ZK login error:', error);
      setZkLoginStatus('Failed to start login');
      setErrors({ general: 'Failed to start ZK login' });
    } finally {
      setIsZkLoginLoading(false);
    }
  };

  // This function now just calls handleZkLogin for the Sui ZK button
  const handleSuiLogin = async () => {
    handleZkLogin();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getFieldClass = (fieldName: keyof ValidationErrors) => {
    const baseClass = "w-full px-4 py-3 text-gray-100 bg-gray-700 bg-opacity-50 rounded-md focus:outline-none focus:ring-2";
    
    if (!touchedFields[fieldName]) {
      return `${baseClass} focus:ring-blue-400`;
    }
    
    return errors[fieldName] 
      ? `${baseClass} border border-red-500 focus:ring-red-400` 
      : `${baseClass} border border-green-500 focus:ring-green-400`;
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'At least one lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'At least one number', met: /[0-9]/.test(formData.password) },
    { label: 'At least one special character', met: /[!@#$%^&*]/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="relative flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 max-w-md w-full space-y-6 bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-16 w-auto" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Create an Account</h2>
          <p className="text-center text-gray-600 dark:text-gray-400">Join thousands of students expanding their knowledge</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => handleSocialSignUp('google')} 
              className="flex items-center justify-center w-1/2 px-4 py-2 text-sm font-semibold text-gray-100 bg-gray-700 rounded-full hover:bg-gray-600"
            >
              <img src="https://img.icons8.com/color/20/000000/google-logo.png" alt="Google Icon" className="mr-2" /> Continue Google
            </button>
            <button 
              onClick={handleSuiLogin} 
              className="flex items-center justify-center w-1/2 px-4 py-2 text-sm font-semibold text-gray-100 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 rounded-full"
              disabled={isZkLoginLoading}
            >
              {isZkLoginLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              {isZkLoginLoading ? 'Processing...' : 'Continue with Sui ZK'}
            </button>
          </div>
          <div className="relative flex items-center justify-center text-gray-300">
            <span className="w-1/2 border-t border-gray-600"></span>
            <span className="px-2 text-sm">or</span>
            <span className="w-1/2 border-t border-gray-600"></span>
          </div>
          <p className="text-center text-gray-300">Fill in the details below to register</p>

          {errors.general && (
            <div className="px-4 py-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded-md">
              {errors.general}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* First Name Field */}
            <div>
              <div className="mb-1 flex justify-between">
                <label htmlFor="first-name" className="text-sm text-gray-400">First Name</label>
                {showError('first_name') && (
                  <span className="text-xs text-red-500">{errors.first_name}</span>
                )}
              </div>
              <input
                type="text"
                id="first-name"
                value={formData.first_name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getFieldClass('first_name')}
                placeholder="Your first name"
                required
                aria-label="First Name"
              />
            </div>

            {/* Last Name Field */}
            <div>
              <div className="mb-1 flex justify-between">
                <label htmlFor="last-name" className="text-sm text-gray-400">Last Name</label>
                {showError('last_name') && (
                  <span className="text-xs text-red-500">{errors.last_name}</span>
                )}
              </div>
              <input
                type="text"
                id="last-name"
                value={formData.last_name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getFieldClass('last_name')}
                placeholder="Your last name"
                required
                aria-label="Last Name"
              />
            </div>

            {/* Username Field */}
            <div>
              <div className="mb-1 flex justify-between">
                <label htmlFor="username" className="text-sm text-gray-400">Username</label>
                {showError('username') && (
                  <span className="text-xs text-red-500">{errors.username}</span>
                )}
              </div>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getFieldClass('username')}
                placeholder="Choose a username"
                required
                aria-label="Username"
              />
            </div>

            {/* Email Field */}
            <div>
              <div className="mb-1 flex justify-between">
                <label htmlFor="email" className="text-sm text-gray-400">Email</label>
                {showError('email') && (
                  <span className="text-xs text-red-500">{errors.email}</span>
                )}
              </div>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getFieldClass('email')}
                placeholder="you@example.com"
                required
                aria-label="Email"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1 flex justify-between">
                <label htmlFor="password" className="text-sm text-gray-400">Password</label>
                {showError('password') && (
                  <span className="text-xs text-red-500">{errors.password}</span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getFieldClass('password')}
                  placeholder="Create a password"
                  required
                  aria-label="Password"
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility} 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              
              {/* Password requirements */}
              {(touchedFields.password || formData.password) && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center text-xs">
                      {req.met ? (
                        <FaCheck className="text-green-500 mr-1" />
                      ) : (
                        <FaTimes className="text-red-500 mr-1" />
                      )}
                      <span className={req.met ? "text-green-500" : "text-red-500"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="mb-1 flex justify-between">
                <label htmlFor="confirm-password" className="text-sm text-gray-400">Confirm Password</label>
                {showError('confirm_password') && (
                  <span className="text-xs text-red-500">{errors.confirm_password}</span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getFieldClass('confirm_password')}
                  placeholder="Confirm your password"
                  required
                  aria-label="Confirm Password"
                />
                <button 
                  type="button" 
                  onClick={toggleConfirmPasswordVisibility} 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 text-white rounded-md transition-all ${isFormValid && !loading ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-400 cursor-not-allowed'}`}
              disabled={!isFormValid || loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <p className="text-sm text-center text-gray-400">
              Already Have An Account? <Link to="/login" className="text-blue-400 hover:underline">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
