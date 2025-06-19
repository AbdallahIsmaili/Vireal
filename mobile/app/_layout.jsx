import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments, Slot } from 'expo-router';
import {
  isAuthenticated,
  getStoredUser,
  signOut as authSignOut,
  clearLocalAuth
} from '@/services/authService';
import { ActivityIndicator, View } from 'react-native';
import "@/global.css";

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  const refreshAuthState = async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const userData = await getStoredUser();
        setUser(userData);
        return userData;
      } else {
        setUser(null);
        return null;
      }
    } catch {
      await clearLocalAuth();
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        await refreshAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const authRoutes = ['onboardingScreen', 'loginScreen', 'signupScreen', 'forgotPasswordScreen'];
    const currentRoute = segments[segments.length - 1] || segments[0] || '';
    const inAuthFlow = authRoutes.includes(currentRoute);

    const timer = setTimeout(() => {
      if (!user && !inAuthFlow) {
        router.replace('/onboardingScreen');
      } else if (user && inAuthFlow) {
        router.replace('/index');
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [user, segments, isLoading, router]);

  const signOut = async () => {
    try {
      await authSignOut();
    } catch {
      await clearLocalAuth();
    } finally {
      setUser(null);
      router.replace('/onboardingScreen');
    }
  };

if (isLoading) return (
  <View className="flex-1 justify-center items-center">
    <ActivityIndicator size="large" color="purple" />
  </View>
);

  return (
    <AuthContext.Provider
      value={{
        user,
        signOut,
        isAuthenticated: !!user,
        refreshAuthState,
      }}
    >
      <Slot />
    </AuthContext.Provider>
  );
}