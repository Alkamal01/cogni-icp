import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { canisterId, createActor } from '../../../declarations/cogni-icp-backend';
import type { User as BackendUser } from '../../../declarations/cogni-icp-backend/cogni-icp-backend.did';

// Extend the User type to include properties expected by the frontend
export interface User extends BackendUser {
  name?: string;
  badges?: any[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  authClient: AuthClient | null;
  identity: Identity | null;
  backendActor: any | null;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [backendActor, setBackendActor] = useState<any | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const client = await AuthClient.create();
      setAuthClient(client);

      if (await client.isAuthenticated()) {
        await handleAuthenticated(client);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) return;
    await authClient.login({
      identityProvider: 'https://identity.ic0.app',
      onSuccess: () => {
        handleAuthenticated(authClient);
      },
    });
  };

  const handleAuthenticated = async (client: AuthClient) => {
    const identity = client.getIdentity();
    const actor = createActor(canisterId, { agentOptions: { identity } });
    
    setIdentity(identity);
    setBackendActor(actor);
    setIsAuthenticated(true);

    const userProfileResult = await actor.get_self() as [User] | [];
    if (userProfileResult.length > 0 && userProfileResult[0]) {
        setUser(userProfileResult[0]);
    } else {
      const principal = identity.getPrincipal().toText();
      const newUser = await actor.create_user(`user_${principal.substring(0, 8)}`, `${principal.substring(0, 8)}@example.com`) as User;
      setUser(newUser);
    }
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
    setBackendActor(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, authClient, identity, backendActor, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};