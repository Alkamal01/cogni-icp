import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../shared';
import Card from '../shared/Card';
import { Input } from '../shared';
import { Shield, CreditCard, User, Mail, Loader2 } from 'lucide-react';
import zkLoginService from '../../services/zkLoginService';

// Simple CardContent component
const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// Simple Label component
const Label: React.FC<{ htmlFor?: string; children: React.ReactNode; className?: string }> = ({ htmlFor, children, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-2 ${className}`}>
    {children}
  </label>
);

interface SuiLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const SuiLogin: React.FC<SuiLoginProps> = ({ onSuccess, onError }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Check for OAuth callback parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idToken = urlParams.get('id_token');
    
    if (idToken) {
      handleOAuthCallback(idToken);
    }
  }, []);

  const handleOAuthCallback = async (jwt: string) => {
    try {
      setStatus('Processing ZK login...');
      setIsConnecting(true);

      // Complete zkLogin flow
      const result = await zkLoginService.handleOAuthCallback(jwt);
      
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
          email: email || undefined,
          decodedJwt: result.decodedJwt
        }),
      });

      if (!response.ok) {
        throw new Error('Backend authentication failed');
      }

      const authData = await response.json();
      
      // Store authentication token
      localStorage.setItem('token', authData.token);
      
      setStatus('Login successful!');
      onSuccess?.();
    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('Login failed');
      onError?.('ZK login failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSuiLogin = async () => {
    try {
      setIsConnecting(true);
      setStatus('Starting ZK login...');

      // Get Google OAuth client ID from environment
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google OAuth client ID not configured');
      }

      // Generate redirect URL for this page
      const redirectUrl = `${window.location.origin}/sui-login`;
      
      // Start zkLogin authentication flow
      await zkLoginService.authenticateWithZkLogin(
        clientId,
        redirectUrl,
        (oauthUrl: string) => {
          // Redirect to Google OAuth
          window.location.href = oauthUrl;
        }
      );
    } catch (error) {
      console.error('ZK login error:', error);
      setStatus('Failed to start login');
      onError?.('Failed to start ZK login');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              PeaceCredit
            </span>
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Sui ZK Login</h1>
          <p className="text-gray-600 mt-2">Secure login with Zero-Knowledge Proofs</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              {status && (
                <div className={`p-3 rounded-lg text-sm ${
                  status.includes('successful') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : status.includes('failed') 
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {status}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email (Optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for notifications"
                  className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">How ZK Login Works</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Connect with Google OAuth</li>
                  <li>• Generate Zero-Knowledge Proof</li>
                  <li>• Create secure Sui wallet address</li>
                  <li>• No private keys to manage</li>
                </ul>
              </div>

              <Button
                onClick={handleSuiLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {status || 'Processing...'}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Login with Google ZK
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">Or</p>
                <a href="/login" className="text-blue-600 hover:text-blue-700">
                  Login with email and password
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuiLogin; 