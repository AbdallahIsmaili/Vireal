import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Text, View, Image, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons, FontAwesome, AntDesign } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import { useAuth } from './_layout'; // Import useAuth
import { 
  initializeGoogleAuth,
  authenticateWithBackend,
  signOut,
  clearLocalAuth,
  isAuthenticated
} from '@/services/authService';

const { width, height } = Dimensions.get('window');

const toastConfig = {
  success: ({ text1, props, ...rest }) => (
    <View className="bg-purple-600 px-5 py-3 rounded-xl shadow-lg mx-4 flex-row items-center">
      <MaterialIcons name="celebration" size={20} color="white" />
      <Text className="text-white font-semibold ml-2">{text1}</Text>
    </View>
  ),
  info: ({ text1, props, ...rest }) => (
    <View className="bg-purple-500 px-5 py-3 rounded-xl shadow-lg mx-4 flex-row items-center">
      <MaterialIcons name="info" size={20} color="white" />
      <Text className="text-white font-semibold ml-2">{text1}</Text>
    </View>
  ),
  error: ({ text1, text2, props, ...rest }) => (
    <View className="bg-red-500 px-5 py-3 rounded-xl shadow-lg mx-4 flex-row items-center">
      <MaterialIcons name="error" size={20} color="white" />
      <View className="ml-2">
        <Text className="text-white font-semibold">{text1}</Text>
        {text2 && <Text className="text-white text-sm">{text2}</Text>}
      </View>
    </View>
  ),
};

const MediaBackground = ({ source, isVideo = false, title, subtitle, buttonText, onButtonPress }) => {
  return (
    <View className="relative" style={{ width, height: height * 0.85 }}>
      {/* Full screen media background */}
      <View className="absolute top-0 left-0 w-full h-full">
        <Image
          source={source}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      
      {/* Content overlay with gradient */}
      <View className="absolute bottom-0 w-full h-3/5">
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.9)', 'white']}
          className="flex-1 justify-end pb-4"
        >
          <View className="top-24 px-8 pb-2 items-center">
            <Text className="text-3xl font-bold text-gray-800 text-center mb-3">
              {title}
            </Text>
            <Text className="text-base text-gray-600 text-center leading-6 px-3 mb-6">
              {subtitle}
            </Text>
            
            {/* Custom Button with purple theme */}
            <TouchableOpacity
              onPress={onButtonPress}
              className="bg-purple-600 px-8 py-4 rounded-full shadow-lg active:bg-purple-700 mb-4"
            >
              <Text className="text-white text-lg font-semibold">
                {buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

function OnboardingScreen() {
  const router = useRouter();
  const { refreshAuthState } = useAuth(); // Get the refresh method from context
  const onboardingRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Encouragement messages for each page
  const encouragementMessages = [
    "Great start! Let's explore Vireal together!",
    "You're doing awesome! Keep going!",
    "Almost there! Ready to join the fun?"
  ];

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (authenticated) {
          // User is already authenticated, redirect to home
          router.replace('/');
          return;
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  // Initialize Google Auth after auth check
  useEffect(() => {
    if (!isCheckingAuth) {
      initializeGoogleAuth();
      Toast.show({
        type: 'success',
        text1: 'Welcome to Vireal! 👋',
        visibilityTime: 2000,
        autoHide: true,
      });
    }
  }, [isCheckingAuth]);

  // Bottom sheet size (60% of screen)
  const snapPoints = useMemo(() => ['60%'], []);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="purple" />
      </View>
    );
  }

  const handleNext = () => {
    const nextPage = currentPage + 1;
    if (nextPage < 3) {
      onboardingRef.current?.goToPage(nextPage);
      showEncouragementToast(nextPage);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setIsOpen(true);
    Toast.show({
      type: 'success',
      text1: 'Welcome to Vireal! 🎉',
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  const showEncouragementToast = (pageIndex) => {
    if (pageIndex < encouragementMessages.length) {
      Toast.show({
        type: 'info',
        text1: encouragementMessages[pageIndex],
        visibilityTime: 2000,
        autoHide: true,
      });
    }
    setCurrentPage(pageIndex);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      
      // 1. Check Play Services with error handling
      try {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true
        });
      } catch (playServicesError) {
        console.error('Play Services Error:', playServicesError);
        throw new Error('Google Play Services are required');
      }

      // 2. Sign in with proper error handling
      let signInResult;
      try {
        signInResult = await GoogleSignin.signIn();
      } catch (signInError) {
        console.error('Google SignIn Error:', signInError);
        if (signInError.code === statusCodes.SIGN_IN_CANCELLED) {
          throw new Error('Sign in was cancelled');
        }
        throw new Error('Failed to sign in with Google');
      }

      console.log('Sign in result:', signInResult);

      // 3. Get the ID token specifically
      let idToken = signInResult.idToken;
      
      // If no idToken in the initial result, try to get tokens
      if (!idToken) {
        try {
          const tokens = await GoogleSignin.getTokens();
          idToken = tokens.idToken;
          console.log('Got tokens:', { hasIdToken: !!tokens.idToken });
        } catch (tokenError) {
          console.error('Error getting tokens:', tokenError);
          throw new Error('Failed to get authentication token from Google');
        }
      }

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // 4. Get user info with proper fallbacks
      const googleUser = await GoogleSignin.getCurrentUser();
      if (!googleUser) {
        throw new Error('Failed to get Google user information');
      }

      console.log('Google user:', googleUser.user);

      // 5. Prepare user data with robust fallbacks
      const userData = {
        email: googleUser.user?.email,
        name: googleUser.user?.givenName || 
              googleUser.user?.name || 
              (googleUser.user?.email ? googleUser.user.email.split('@')[0] : 'User'),
        photo: googleUser.user?.photo || null
      };

      if (!userData.email) {
        throw new Error('Google account email is required');
      }

      console.log('Prepared user data:', userData);

      // 6. Authenticate with backend - ONLY use idToken
      await authenticateWithBackend('google', {
        idToken: idToken, // Only send idToken, not serverAuthCode
        user: userData
      });
      
      setIsOpen(false);
      
      Toast.show({
        type: 'success',
        text1: 'Sign in successful!',
        text2: 'Welcome to Vireal!',
        visibilityTime: 2000,
      });

      // 7. Refresh auth state in the root layout
      console.log('Refreshing auth state after successful login...');
      await refreshAuthState();
      router.replace('/');

      
      
    } catch (error) {
      console.error('Google Sign In Error:', error);
      
      let errorMessage = 'Sign in failed';
      let detailedMessage = error.message || 'An unknown error occurred';
      
      if (error.code) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            errorMessage = 'Sign in cancelled';
            detailedMessage = 'You cancelled the sign in process';
            break;
          case statusCodes.IN_PROGRESS:
            errorMessage = 'Sign in in progress';
            detailedMessage = 'Please wait for current sign in to complete';
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            errorMessage = 'Play Services not available';
            detailedMessage = 'Google Play Services are required';
            break;
        }
      }
      
      Toast.show({
        type: 'error',
        text1: errorMessage,
        text2: detailedMessage,
        visibilityTime: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacebookSignIn = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'Facebook sign in will be available soon!',
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  const handleAppleSignIn = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'Apple sign in will be available soon!',
      visibilityTime: 3000,
      autoHide: true,
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
        
        <Onboarding
          ref={onboardingRef}
          onPageChange={showEncouragementToast}
          pages={[
            {
              backgroundColor: 'transparent',
              image: (
                <MediaBackground 
                  source={require('@/assets/animations/slide-1.gif')}
                  isVideo={false}
                  title="Welcome to Vireal"
                  subtitle="Join multiple communities, connect with members, and climb the rankings in your favorite clans"
                  buttonText="Next"
                  onButtonPress={handleNext}
                />
              ),
              title: '',
              subtitle: '',
            },
            {
              backgroundColor: 'transparent',
              image: (
                <MediaBackground 
                  source={require('@/assets/animations/animation-2.jpg')}
                  isVideo={false}
                  title="Compete & Share"
                  subtitle="Participate in exciting competitions, share your posts, and earn your place among the top members"
                  buttonText="Next"
                  onButtonPress={handleNext}
                />
              ),
              title: '',
              subtitle: '',
            },
            {
              backgroundColor: 'transparent',
              image: (
                <MediaBackground 
                  source={require('@/assets/animations/slide-3.jpg')}
                  isVideo={false}
                  title="Ready for Fun?"
                  subtitle="Explore communities, build your reputation, and experience the ultimate social gaming platform"
                  buttonText="Enjoy Vireal"
                  onButtonPress={handleFinish}
                />
              ),
              title: '',
              subtitle: '',
            },
          ]}
          showTitle={false}
          showSubtitle={false}
          showNext={false}
          showSkip={false}
          showDone={false}
          containerStyles={{
            paddingBottom: 20,
          }}
          imageContainerStyles={{
            paddingBottom: 0,
            flex: 1,
          }}
          bottomBarStyle={{
            backgroundColor: 'transparent',
            paddingHorizontal: 0,
            paddingVertical: 0,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          bottomBarHighlight={false}
          controlStatusBar={false}
          flatlistProps={{
            scrollEnabled: true,
          }}
          dotStyle={{
            backgroundColor: 'rgba(255,255,255,0.5)',
            width: 8,
            height: 8,
            marginHorizontal: 4,
          }}
          selectedDotStyle={{
            backgroundColor: 'white',
            width: 20,
            height: 8,
            marginHorizontal: 4,
          }}
        />

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onClose={() => setIsOpen(false)}
          index={isOpen ? 0 : -1}
          backgroundStyle={{ backgroundColor: '#f8f9fa' }}
          handleIndicatorStyle={{ backgroundColor: '#6c757d' }}
        >
          <BottomSheetView style={{ padding: 24, flex: 1 }}>
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Join Vireal
            </Text>
            <Text className="text-gray-600 mb-8">
              Sign up or log in to start connecting with communities
            </Text>

            {/* Google Button */}
            <TouchableOpacity
              className={`flex-row items-center justify-center bg-white px-6 py-4 rounded-lg mb-4 border border-gray-300 ${
                isSubmitting ? 'opacity-50' : ''
              }`}
              activeOpacity={0.8}
              onPress={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <FontAwesome name="google" size={20} color="#DB4437" />
              <Text className="text-gray-800 font-semibold ml-3">
                {isSubmitting ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* Facebook Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-blue-600 px-6 py-4 rounded-lg mb-4"
              activeOpacity={0.8}
              onPress={handleFacebookSignIn}
              disabled={isSubmitting}
            >
              <FontAwesome name="facebook" size={20} color="white" />
              <Text className="text-white font-semibold ml-3">
                Continue with Facebook
              </Text>
            </TouchableOpacity>

            {/* Apple Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-black px-6 py-4 rounded-lg"
              activeOpacity={0.8}
              onPress={handleAppleSignIn}
              disabled={isSubmitting}
            >
              <AntDesign name="apple1" size={20} color="white" />
              <Text className="text-white font-semibold ml-3">
                Continue with Apple
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-500">
                Read before joining{' '}
              </Text>
              <TouchableOpacity>
                <Text className="text-purple-600 font-semibold">Our community roles</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </BottomSheet>

        {/* Toast component */}
        <Toast config={toastConfig} position="top" bottomOffset={20} />
      </View>
    </GestureHandlerRootView>
  );
}

export default OnboardingScreen;