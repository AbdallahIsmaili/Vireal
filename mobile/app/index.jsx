import { Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "./_layout";
import { MaterialIcons, FontAwesome, AntDesign } from '@expo/vector-icons';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  // Show loading or return null if user is not loaded yet
  if (!user) {
    return null;
  }

  const getProviderIcon = () => {
    switch(user.authProvider) {
      case 'google':
        return <FontAwesome name="google" size={16} color="#DB4437" />;
      case 'facebook':
        return <FontAwesome name="facebook" size={16} color="#4267B2" />;
      case 'apple':
        return <AntDesign name="apple1" size={16} color="black" />;
      default:
        return <MaterialIcons name="verified-user" size={16} color="#6b7280" />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header with Banner */}
        <View className="relative">
          <Image 
            source={{ uri: user.banner || 'https://cdn.vireal.com/default-banner.jpg' }}
            className="w-full h-40"
            resizeMode="cover"
          />
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent h-20" />
          
          <View className="absolute bottom-4 left-6 flex-row items-end">
            <Image 
              source={{ uri: user.avatar || 'https://cdn.vireal.com/default-avatar.png' }} 
              className="w-20 h-20 rounded-full border-4 border-white"
            />
            <View className="ml-4 mb-2">
              <Text className="text-white text-xl font-bold">
                {user.username}
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-white/80 text-sm">
                  Level {user.level}
                </Text>
                <View className="w-1 h-1 bg-white/50 rounded-full mx-2" />
                <Text className="text-white/80 text-sm">
                  {user.xp}/{user.nextLevelXP} XP
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={signOut}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30"
          >
            <MaterialIcons name="logout" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <View className="bg-white px-6 py-3 flex-row justify-between shadow-sm">
          <View className="items-center">
            <Text className="text-gray-900 font-bold">{user.followers || 0}</Text>
            <Text className="text-gray-500 text-xs">Followers</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-900 font-bold">{user.following || 0}</Text>
            <Text className="text-gray-500 text-xs">Following</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-900 font-bold">{user.postIds?.length || 0}</Text>
            <Text className="text-gray-500 text-xs">Posts</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-900 font-bold">{user.communityMemberships?.filter(c => c.isActive)?.length || 0}</Text>
            <Text className="text-gray-500 text-xs">Communities</Text>
          </View>
        </View>

        {/* Profile Info */}
        <View className="mx-6 mt-6 bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-4">Profile Info</Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <MaterialIcons name="badge" size={20} color="#6b7280" />
              <Text className="ml-3 text-gray-700">
                {user.username}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <MaterialIcons name="email" size={20} color="#6b7280" />
              <Text className="ml-3 text-gray-700">
                {user.email}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              {getProviderIcon()}
              <Text className="ml-3 text-gray-700">
                Signed in with {user.authProvider}
              </Text>
            </View>
            
            {user.createdAt && (
              <View className="flex-row items-center">
                <MaterialIcons name="calendar-today" size={20} color="#6b7280" />
                <Text className="ml-3 text-gray-700">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}
            
            {user.bio && (
              <View className="flex-row items-start">
                <MaterialIcons name="info" size={20} color="#6b7280" />
                <Text className="ml-3 text-gray-700 flex-1">
                  {user.bio}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Titles & Roles */}
        <View className="mx-6 mt-6 bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-4">Titles & Roles</Text>
          
          {user.titleIds?.length > 0 ? (
            <View className="flex-row flex-wrap">
              {user.titleIds.map((titleId, index) => (
                <View key={index} className="bg-purple-100 px-3 py-1 rounded-full mr-2 mb-2">
                  <Text className="text-purple-800 text-sm">Title #{index + 1}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500">No titles yet</Text>
          )}
          
          <View className="mt-4">
            <Text className="font-semibold text-gray-700 mb-2">Roles:</Text>
            {user.roleIds?.length > 0 ? (
              <View className="flex-row flex-wrap">
                {user.roleIds.map((roleId, index) => (
                  <View key={index} className="bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
                    <Text className="text-blue-800 text-sm">Role #{index + 1}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500">No roles yet</Text>
            )}
          </View>
        </View>

        {/* Organizations */}
        {user.organizationMemberships?.length > 0 && (
          <View className="mx-6 mt-6 bg-white rounded-xl p-6 shadow-sm">
            <Text className="text-xl font-bold text-gray-900 mb-4">Organizations</Text>
            
            {user.organizationMemberships.map((org, index) => (
              <View key={index} className="mb-3 last:mb-0">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                    <Text className="font-bold text-gray-600">Org</Text>
                  </View>
                  <View>
                    <Text className="font-semibold text-gray-800">Organization #{index + 1}</Text>
                    <Text className="text-gray-500 text-sm">{org.rank}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View className="mx-6 mt-6 mb-8 bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
          
          <View className="space-y-3">
            <TouchableOpacity className="bg-purple-600 py-3 px-4 rounded-lg flex-row items-center justify-center">
              <MaterialIcons name="groups" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Explore Communities
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-blue-500 py-3 px-4 rounded-lg flex-row items-center justify-center">
              <MaterialIcons name="emoji-events" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                View Competitions
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-gray-100 py-3 px-4 rounded-lg flex-row items-center justify-center">
              <MaterialIcons name="leaderboard" size={20} color="#6b7280" />
              <Text className="text-gray-700 font-semibold ml-2">
                Check Rankings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}