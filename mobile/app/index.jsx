import { Text, View, Image, TouchableOpacity, ScrollView, FlatList, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "./_layout";
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useState, useRef, useEffect } from 'react';

const { width, height } = Dimensions.get('window');

export default function CommunitiesScreen() {
  const { user, signOut } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-320)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Create animated values for each menu item
  const menuItemAnims = useRef(
    Array.from({ length: 7 }, () => ({
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  // Mock data for communities
  const myCommunities = [
    { id: 1, name: "React Native", image: "https://picsum.photos/150/150?random=1", members: "12k", gradient: ['#FF6B6B', '#FF8E8E'] },
    { id: 2, name: "JavaScript", image: "https://picsum.photos/150/150?random=2", members: "8.5k", gradient: ['#4ECDC4', '#44A08D'] },
    { id: 3, name: "UI/UX Design", image: "https://picsum.photos/150/150?random=3", members: "15k", gradient: ['#A8E6CF', '#88D8A3'] },
    { id: 4, name: "Mobile Dev", image: "https://picsum.photos/150/150?random=4", members: "6.2k", gradient: ['#FFD93D', '#FF9A3D'] },
  ];

  const recommendedCommunities = [
    { id: 5, name: "Flutter", image: "https://picsum.photos/150/150?random=5", members: "9.8k", gradient: ['#667eea', '#764ba2'] },
    { id: 6, name: "Node.js", image: "https://picsum.photos/150/150?random=6", members: "11k", gradient: ['#f093fb', '#f5576c'] },
    { id: 7, name: "GraphQL", image: "https://picsum.photos/150/150?random=7", members: "7.3k", gradient: ['#4facfe', '#00f2fe'] },
    { id: 8, name: "TypeScript", image: "https://picsum.photos/150/150?random=8", members: "13k", gradient: ['#fa709a', '#fee140'] },
  ];

  const animeCommunities = [
    { id: 9, name: "Anime Lovers", image: "https://picsum.photos/150/150?random=9", members: "25k", gradient: ['#ff9a9e', '#fecfef'] },
    { id: 10, name: "Manga Readers", image: "https://picsum.photos/150/150?random=10", members: "18k", gradient: ['#a18cd1', '#fbc2eb'] },
    { id: 11, name: "Studio Ghibli", image: "https://picsum.photos/150/150?random=11", members: "14k", gradient: ['#ffecd2', '#fcb69f'] },
    { id: 12, name: "Cosplay", image: "https://picsum.photos/150/150?random=12", members: "22k", gradient: ['#ff8a80', '#ff80ab'] },
  ];

  const artsCommunities = [
    { id: 13, name: "Digital Art", image: "https://picsum.photos/150/150?random=13", members: "30k", gradient: ['#667eea', '#764ba2'] },
    { id: 14, name: "Photography", image: "https://picsum.photos/150/150?random=14", members: "45k", gradient: ['#f093fb', '#f5576c'] },
    { id: 15, name: "Illustration", image: "https://picsum.photos/150/150?random=15", members: "28k", gradient: ['#4facfe', '#00f2fe'] },
    { id: 16, name: "Sketching", image: "https://picsum.photos/150/150?random=16", members: "16k", gradient: ['#43e97b', '#38f9d7'] },
  ];

  const gamesCommunities = [
    { id: 17, name: "Mobile Gaming", image: "https://picsum.photos/150/150?random=17", members: "55k", gradient: ['#fa709a', '#fee140'] },
    { id: 18, name: "Indie Games", image: "https://picsum.photos/150/150?random=18", members: "32k", gradient: ['#667eea', '#764ba2'] },
    { id: 19, name: "Retro Gaming", image: "https://picsum.photos/150/150?random=19", members: "41k", gradient: ['#f093fb', '#f5576c'] },
    { id: 20, name: "Game Dev", image: "https://picsum.photos/150/150?random=20", members: "23k", gradient: ['#4facfe', '#00f2fe'] },
  ];

  const sportsCommunities = [
    { id: 21, name: "Football", image: "https://picsum.photos/150/150?random=21", members: "78k", gradient: ['#fa709a', '#fee140'] },
    { id: 22, name: "Basketball", image: "https://picsum.photos/150/150?random=22", members: "62k", gradient: ['#667eea', '#764ba2'] },
    { id: 23, name: "Tennis", image: "https://picsum.photos/150/150?random=23", members: "35k", gradient: ['#f093fb', '#f5576c'] },
    { id: 24, name: "Fitness", image: "https://picsum.photos/150/150?random=24", members: "91k", gradient: ['#4facfe', '#00f2fe'] },
  ];

  const menuItems = [
    { id: 1, title: "Vireal Plus", icon: "star", color: "#FFD700" },
    { id: 2, title: "Settings", icon: "settings", color: "#8B5CF6" },
    { id: 3, title: "Payments", icon: "credit-card", color: "#10B981" },
    { id: 4, title: "Your Data", icon: "database", color: "#F59E0B" },
    { id: 5, title: "Help", icon: "help-circle", color: "#3B82F6" },
    { id: 6, title: "Send Feedback", icon: "message-circle", color: "#EC4899" },
    { id: 7, title: "About", icon: "info", color: "#6366F1" },
  ];

  // Function to animate menu items with staggered effect
  const animateMenuItems = (show) => {
    const toValue = show ? 0 : -50;
    const opacityValue = show ? 1 : 0;
    
    // Animate all items simultaneously
    Animated.parallel(
      menuItemAnims.map(anim => 
        Animated.parallel([
          Animated.timing(anim.translateX, {
            toValue,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: opacityValue,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();
  };

  const toggleMenu = () => {
    const toValue = menuVisible ? -320 : 0;
    const fadeValue = 0;
    const scaleValue = menuVisible ? 1 : 0.95;
    
    setMenuVisible(!menuVisible);
    
    // Optimized animation with spring for main menu and timing for others
    Animated.parallel([
      // Main slide animation with optimized spring
      Animated.spring(slideAnim, {
        toValue,
        useNativeDriver: true,
        speed: 20,
        bounciness: 0,
      }),
      // Fade animation for overlay
      Animated.timing(fadeAnim, {
        toValue: fadeValue,
        duration: 0.1,
        useNativeDriver: true,
      }),
      // Scale animation for background
      Animated.timing(scaleAnim, {
        toValue: scaleValue,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate menu items immediately with no delay
    animateMenuItems(!menuVisible);
  };

  const handleMenuItemPress = (item) => {
    console.log(`Pressed: ${item.title}`);
    toggleMenu();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toggleMenu(); // Close menu after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderMyCommunityItem = ({ item }) => (
    <TouchableOpacity className="mr-4 items-center" activeOpacity={0.8}>
      <View className="items-center relative">
        <View className="relative">
          <Image 
            source={{ uri: item.image }} 
            className="w-36 h-36 rounded-3xl mb-3"
            resizeMode="cover"
          />
          {/* Member count popup overlay for My Communities */}
          <View className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/20">
            <Text className="text-white text-xs font-semibold">
              {item.members}
            </Text>
          </View>
        </View>
        <Text className="text-white text-sm font-bold text-center max-w-36" numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCommunityItem = ({ item }) => (
    <TouchableOpacity className="mr-4 items-center" activeOpacity={0.8}>
      <View className="items-center relative">
        <View className="relative">
          <Image 
            source={{ uri: item.image }} 
            className="w-48 h-48 rounded-3xl mb-4"
            resizeMode="cover"
          />
          {/* Member count popup overlay */}
          <View className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
            <Text className="text-white text-xs font-semibold">
              {item.members}
            </Text>
          </View>
        </View>
        <Text className="text-white text-base font-bold text-center max-w-56" numberOfLines={2}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const MyCommunitySection = ({ title, data }) => (
    <View className="mb-8">
      <View className="mx-6 mb-4">
        <Text className="text-white text-lg font-semibold mb-4">{title}</Text>
        <View className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 pb-12 ">
          <FlatList
            data={data}
            renderItem={renderMyCommunityItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          />
        </View>
      </View>
    </View>
  );

  const CommunitySection = ({ title, data, showChoose = false }) => (
    <View className="mb-8">
      <View className="flex-row items-center justify-between mb-4 px-6">
        <Text className="text-white text-lg font-semibold">{title}</Text>
        {showChoose && (
          <TouchableOpacity className="flex-row items-center bg-purple-800/40 px-3 py-2 rounded-full border border-purple-600/40">
            <Text className="text-purple-300 text-sm mr-1 font-medium">Choose Community</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#d8b4fe" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        renderItem={renderCommunityItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        snapToInterval={240}
        decelerationRate="fast"
      />
    </View>
  );

  if (!user) {
    return null;
  }

  return (
    <View className="flex-1">
      {/* Purple-White-Black Gradient Background */}
      <LinearGradient
        colors={['#9333EA', '#9333EA', '#1F2937', '#000000', '#000000']}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
      >
        {/* Main Content with Scale Animation */}
        <Animated.View 
          className="flex-1"
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <SafeAreaView className="flex-1">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View className="flex-row items-center justify-between px-6 py-4">
                <TouchableOpacity 
                  className="w-10 h-10 bg-gray-800/60 rounded-full items-center justify-center border border-gray-700/50"
                  onPress={toggleMenu}
                >
                  <Ionicons name="menu" size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600">
                  <Image 
                    source={{ uri: user?.avatar || 'https://cdn.vireal.com/default-avatar.png' }} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>

              {/* Enhanced Title with better styling */}
              <View className="px-6 mb-12">
                <View className="relative">
                  <Text className="text-white text-5xl font-black leading-tight tracking-tight">
                    ✨ Discover your{'\n'}
                    <Text 
                      className="text-white"
                      style={{
                        textShadowColor: 'rgba(255, 255, 255, 0.3)',
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: 20,
                        fontWeight: '900',
                        letterSpacing: -1
                      }}
                    >
                      Perfect Communities!
                    </Text>
                  </Text>
                  {/* Subtle glow effect */}
                  <View className="absolute inset-0 opacity-20">
                    <View className="bg-gradient-to-r from-purple-900 via-pink-700 to-blue-600 rounded-3xl h-24 w-full blur-2xl" />
                  </View>
                </View>
              </View>

              {/* Toggle Buttons */}
              <View className="mx-6 mb-8">
                <View className="flex-row bg-gray-800/60 rounded-3xl p-1 ">
                  <TouchableOpacity className="flex-1 bg-white/90 rounded-3xl py-4 items-center">
                    <Text className="text-9333EA font-semibold">Communities</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 py-4 items-center">
                    <Text className="text-gray-400 font-semibold">Events</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* My Communities - Special framed section */}
              <MyCommunitySection 
                title="My Communities" 
                data={myCommunities}
              />

              {/* Recommended */}
              <CommunitySection 
                title="Recommended" 
                data={recommendedCommunities} 
                showChoose={true}
              />

              {/* Best Communities for Anime */}
              <CommunitySection 
                title="🎌 Best Communities for Anime" 
                data={animeCommunities} 
              />

              {/* Best Communities for Arts */}
              <CommunitySection 
                title="🎨 Best Communities for Arts" 
                data={artsCommunities} 
              />

              {/* Best Communities for Games */}
              <CommunitySection 
                title="🎮 Best Communities for Games" 
                data={gamesCommunities} 
              />

              {/* Best Communities for Sports */}
              <CommunitySection 
                title="⚽ Best Communities for Sports" 
                data={sportsCommunities} 
              />

              {/* Bottom spacing */}
              <View className="h-8" />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>

        {/* Enhanced Blur Overlay */}
        {menuVisible && (
          <Animated.View 
            className="absolute inset-0"
            style={{ opacity: fadeAnim }}
            pointerEvents={menuVisible ? 'auto' : 'none'}
          >
            <BlurView 
              intensity={20}
              tint="dark"
              className="flex-1"
            >
              <TouchableOpacity 
                className="flex-1"
                onPress={toggleMenu}
                activeOpacity={1}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                }}
              />
            </BlurView>
          </Animated.View>
        )}

        {/* Enhanced Animated Dropdown Menu */}
        <Animated.View 
          className="absolute top-0 left-0 w-80 h-full shadow-2xl"
          style={{
            transform: [{ translateX: slideAnim }],
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 5, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
          }}
          pointerEvents={menuVisible ? 'auto' : 'none'}
        >
          <BlurView 
            intensity={100}
            tint="dark"
            className="flex-1 border-r border-white/20"
          >
            <View className="flex-1 bg-slate-900/95">
              <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
                {/* Menu Header */}
                <View className="p-6 border-b border-gray-700/50">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-white text-xl font-bold">Menu</Text>
                    <TouchableOpacity 
                      onPress={toggleMenu}
                      className="w-8 h-8 rounded-full bg-gray-700/60 items-center justify-center"
                    >
                      <Ionicons name="close" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* User Info */}
                  <View className="flex-row items-center">
                    <Image 
                      source={{ uri: user?.avatar || 'https://cdn.vireal.com/default-avatar.png' }} 
                      className="w-12 h-12 rounded-full border-2 border-gray-600"
                      resizeMode="cover"
                    />
                    <View className="ml-3">
                      <Text className="text-white font-semibold">{user?.username || 'User'}</Text>
                      <Text className="text-gray-400 text-sm">{user?.email || 'user@example.com'}</Text>
                    </View>
                  </View>
                </View>

                {/* Menu Items with Enhanced Staggered Animation */}
                <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                  {menuItems.map((item, index) => (
                    <Animated.View
                      key={item.id}
                      style={{
                        transform: [{ 
                          translateX: menuItemAnims[index].translateX 
                        }],
                        opacity: menuItemAnims[index].opacity,
                      }}
                    >
                      <TouchableOpacity
                        className="flex-row items-center p-4 rounded-2xl mb-2 bg-gray-700/30 border border-gray-600/30"
                        onPress={() => handleMenuItemPress(item)}
                        activeOpacity={0.7}
                      >
                        <View 
                          className="w-10 h-10 rounded-full items-center justify-center mr-4"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <Feather name={item.icon} size={20} color={item.color} />
                        </View>
                        <Text className="text-white font-medium flex-1">{item.title}</Text>
                        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </ScrollView>

                {/* Menu Footer with Functional Logout */}
                <View className="p-6 border-t border-gray-700/50">
                  <TouchableOpacity 
                    className="flex-row items-center justify-center p-3 rounded-2xl bg-red-600/20 border border-red-500/30"
                    activeOpacity={0.7}
                    onPress={handleLogout}
                  >
                    <Feather name="log-out" size={18} color="#EF4444" className="mr-2" />
                    <Text className="text-red-400 font-medium ml-2">Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          </BlurView>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}