import React, { useState, useRef } from 'react';
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Animated, 
  Dimensions,
  Alert,
  Switch
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from "../_layout";
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function CreateCommunityScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    slogan: '',
    description: '',
    language: 'en',
    tags: [],
    helloMessage: '',
    visibility: 'public',
    isModerated: true,
    requireApprovalForJoin: false,
    allowedPostTypes: ['plog', 'wiki', 'poll', 'image', 'link'],
    allowedClanIds: [],
    allowedCommitteeIds: [],
    enabledSections: {
      home: true,
      wiki: true,
      chat: true,
      latest: true,
      topOfWeek: true,
      news: true,
      clanZone: false
    },
    customColors: {
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#0F172A'
    }
  });

  const [tagInput, setTagInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const steps = [
    { title: 'Basic Info', icon: 'info' },
    { title: 'Customize', icon: 'palette' },
    { title: 'Settings', icon: 'settings' },
    { title: 'Review', icon: 'check-circle' }
  ];

  const postTypes = [
    { id: 'plog', name: 'Personal Blog', icon: 'edit', color: '#8B5CF6' },
    { id: 'wiki', name: 'Wiki', icon: 'book', color: '#10B981' },
    { id: 'poll', name: 'Poll', icon: 'bar-chart', color: '#F59E0B' },
    { id: 'image', name: 'Image', icon: 'image', color: '#EC4899' },
    { id: 'link', name: 'Link', icon: 'link', color: '#3B82F6' },
    { id: 'quiz', name: 'Quiz', icon: 'help-circle', color: '#8B5CF6' },
    { id: 'question', name: 'Question', icon: 'message-circle', color: '#10B981' },
    { id: 'chatroom', name: 'Chatroom', icon: 'message-square', color: '#F59E0B' }
  ];

  const visibilityOptions = [
    { id: 'public', name: 'Public', desc: 'Anyone can find and join', icon: 'globe' },
    { id: 'private', name: 'Private', desc: 'Only members can see content', icon: 'lock' },
    { id: 'invite-only', name: 'Invite Only', desc: 'Members can only join via invite', icon: 'user-plus' }
  ];

  const colorPresets = [
    { primary: '#8B5CF6', secondary: '#EC4899', accent: '#0F172A', name: 'Purple Pink' },
    { primary: '#3B82F6', secondary: '#10B981', accent: '#0F172A', name: 'Blue Green' },
    { primary: '#F59E0B', secondary: '#EF4444', accent: '#0F172A', name: 'Orange Red' },
    { primary: '#10B981', secondary: '#06B6D4', accent: '#0F172A', name: 'Green Cyan' }
  ];

  // Sample clans data - in a real app, this would come from an API
  const clans = [
    { id: '66510d12d5b6f4e73000ab21', name: 'Demonic', icon: 'fire', color: '#EF4444' },
    { id: '66510d12d5b6f4e73000ab22', name: 'Celestial', icon: 'star', color: '#3B82F6' },
    { id: '66510d12d5b6f4e73000ab23', name: 'Sprite', icon: 'feather', color: '#10B981' },
    { id: '66510d12d5b6f4e73000ab24', name: 'Titan', icon: 'shield', color: '#F59E0B' },
    { id: '66510d12d5b6f4e73000ab25', name: 'Phantom', icon: 'ghost', color: '#8B5CF6' }
  ];

  // Sample committees data - in a real app, this would come from an API
  const committees = [
    { id: '665110faad1cf91f56d00c111', name: 'Police', icon: 'shield', color: '#3B82F6' },
    { id: '665110faad1cf91f56d00c112', name: 'Feed Moderators', icon: 'eye', color: '#10B981' },
    { id: '665110faad1cf91f56d00c113', name: 'Art and Design', icon: 'palette', color: '#EC4899' },
    { id: '665110faad1cf91f56d00c114', name: 'Events', icon: 'calendar', color: '#F59E0B' },
    { id: '665110faad1cf91f56d00c115', name: 'Support', icon: 'help-circle', color: '#8B5CF6' }
  ];

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate slug from name
    if (field === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && formData.tags.length < 5 && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const togglePostType = (postType) => {
    setFormData(prev => ({
      ...prev,
      allowedPostTypes: prev.allowedPostTypes.includes(postType)
        ? prev.allowedPostTypes.filter(type => type !== postType)
        : [...prev.allowedPostTypes, postType]
    }));
  };

  const toggleClan = (clanId) => {
    setFormData(prev => ({
      ...prev,
      allowedClanIds: prev.allowedClanIds.includes(clanId)
        ? prev.allowedClanIds.filter(id => id !== clanId)
        : [...prev.allowedClanIds, clanId]
    }));
  };

  const toggleCommittee = (committeeId) => {
    setFormData(prev => ({
      ...prev,
      allowedCommitteeIds: prev.allowedCommitteeIds.includes(committeeId)
        ? prev.allowedCommitteeIds.filter(id => id !== committeeId)
        : [...prev.allowedCommitteeIds, committeeId]
    }));
  };

  const toggleSection = (section) => {
    setFormData(prev => ({
      ...prev,
      enabledSections: {
        ...prev.enabledSections,
        [section]: !prev.enabledSections[section]
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      Animated.timing(slideAnim, {
        toValue: -newStep * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      
      Animated.timing(slideAnim, {
        toValue: -newStep * width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.description || !formData.slogan) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Here you would typically send the data to your API
    console.log('Creating community:', formData);
    
    Alert.alert(
      'Success!', 
      'Your community has been created successfully!',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const renderStepIndicator = () => (
    <View className="flex-row justify-center items-center mb-8 px-6">
      {steps.map((step, index) => (
        <View key={index} className="flex-row items-center">
          <View className={`w-10 h-10 rounded-full items-center justify-center border-2 ${
            index <= currentStep 
              ? 'bg-purple-600 border-purple-600' 
              : 'bg-gray-700/50 border-gray-600'
          }`}>
            {index < currentStep ? (
              <Ionicons name="checkmark" size={20} color="white" />
            ) : (
              <Text className={`text-sm font-bold ${
                index <= currentStep ? 'text-white' : 'text-gray-400'
              }`}>
                {index + 1}
              </Text>
            )}
          </View>
          {index < steps.length - 1 && (
            <View className={`w-12 h-0.5 mx-2 ${
              index < currentStep ? 'bg-purple-600' : 'bg-gray-600'
            }`} />
          )}
        </View>
      ))}
    </View>
  );

  const renderBasicInfo = () => (
    <View className="px-6">
      <Text className="text-white text-2xl font-bold mb-6">Basic Information</Text>
      
      {/* Community Name */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-2">Community Name *</Text>
        <TextInput
          className="bg-gray-800/60 text-white p-4 rounded-2xl border border-gray-700/50"
          placeholder="Enter community name"
          placeholderTextColor="#9CA3AF"
          value={formData.name}
          onChangeText={(text) => updateFormData('name', text)}
          maxLength={50}
        />
        <Text className="text-gray-400 text-xs mt-1">{formData.name.length}/50</Text>
      </View>

      {/* Slug */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-2">URL Slug</Text>
        <View className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-4">
          <Text className="text-gray-400 text-sm">vireal.com/c/</Text>
          <Text className="text-white font-medium">{formData.slug || 'your-community'}</Text>
        </View>
      </View>

      {/* Slogan */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-2">Slogan *</Text>
        <TextInput
          className="bg-gray-800/60 text-white p-4 rounded-2xl border border-gray-700/50"
          placeholder="A catchy slogan for your community"
          placeholderTextColor="#9CA3AF"
          value={formData.slogan}
          onChangeText={(text) => updateFormData('slogan', text)}
          maxLength={100}
        />
        <Text className="text-gray-400 text-xs mt-1">{formData.slogan.length}/100</Text>
      </View>

      {/* Description */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-2">Description *</Text>
        <TextInput
          className="bg-gray-800/60 text-white p-4 rounded-2xl border border-gray-700/50 h-32"
          placeholder="Describe what your community is about..."
          placeholderTextColor="#9CA3AF"
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />
        <Text className="text-gray-400 text-xs mt-1">{formData.description.length}/500</Text>
      </View>

      {/* Tags */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-2">Tags (up to 5)</Text>
        <View className="flex-row flex-wrap mb-3">
          {formData.tags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              className="bg-purple-600/20 border border-purple-500/30 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
              onPress={() => removeTag(tag)}
            >
              <Text className="text-purple-300 text-sm mr-1">{tag}</Text>
              <Ionicons name="close" size={14} color="#d8b4fe" />
            </TouchableOpacity>
          ))}
        </View>
        {formData.tags.length < 5 && (
          <View className="flex-row">
            <TextInput
              className="flex-1 bg-gray-800/60 text-white p-4 rounded-2xl border border-gray-700/50 mr-3"
              placeholder="Add a tag"
              placeholderTextColor="#9CA3AF"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
            />
            <TouchableOpacity
              className="bg-purple-600 w-12 h-12 rounded-2xl items-center justify-center"
              onPress={addTag}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderCustomize = () => (
    <View className="px-6">
      <Text className="text-white text-2xl font-bold mb-6">Customize Appearance</Text>
      
      {/* Color Themes */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-3">Color Theme</Text>
        <View className="flex-row flex-wrap">
          {colorPresets.map((preset, index) => (
            <TouchableOpacity
              key={index}
              className={`w-20 h-20 rounded-2xl mr-3 mb-3 border-2 ${
                formData.customColors.primary === preset.primary
                  ? 'border-white'
                  : 'border-gray-600'
              }`}
              onPress={() => updateFormData('customColors', preset)}
            >
              <LinearGradient
                colors={[preset.primary, preset.secondary]}
                className="flex-1 rounded-2xl items-center justify-center"
              >
                {formData.customColors.primary === preset.primary && (
                  <Ionicons name="checkmark" size={24} color="white" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Hello Message */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-2">Welcome Message</Text>
        <TextInput
          className="bg-gray-800/60 text-white p-4 rounded-2xl border border-gray-700/50 h-24"
          placeholder="Welcome message for new members..."
          placeholderTextColor="#9CA3AF"
          value={formData.helloMessage}
          onChangeText={(text) => updateFormData('helloMessage', text)}
          multiline
          textAlignVertical="top"
          maxLength={200}
        />
        <Text className="text-gray-400 text-xs mt-1">{formData.helloMessage.length}/200</Text>
      </View>

      {/* Community Icon */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-3">Community Icon</Text>
        <TouchableOpacity className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-4 flex-row items-center">
          <View className="w-16 h-16 bg-gray-700 rounded-2xl items-center justify-center mr-4">
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} className="w-full h-full rounded-2xl" />
            ) : (
              <Ionicons name="image" size={32} color="#9CA3AF" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-white font-medium">Upload Icon</Text>
            <Text className="text-gray-400 text-sm">Recommended: 512x512px</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSettings = () => (
    <View className="px-6">
      <Text className="text-white text-2xl font-bold mb-6">Community Settings</Text>
      
      {/* Visibility */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-3">Visibility</Text>
        {visibilityOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            className={`p-4 rounded-2xl mb-3 border ${
              formData.visibility === option.id
                ? 'bg-purple-600/20 border-purple-500/50'
                : 'bg-gray-800/60 border-gray-700/50'
            }`}
            onPress={() => updateFormData('visibility', option.id)}
          >
            <View className="flex-row items-center">
              <Feather 
                name={option.icon} 
                size={20} 
                color={formData.visibility === option.id ? '#8B5CF6' : '#9CA3AF'} 
              />
              <View className="ml-3 flex-1">
                <Text className={`font-medium ${
                  formData.visibility === option.id ? 'text-purple-300' : 'text-white'
                }`}>
                  {option.name}
                </Text>
                <Text className="text-gray-400 text-sm">{option.desc}</Text>
              </View>
              {formData.visibility === option.id && (
                <Ionicons name="radio-button-on" size={20} color="#8B5CF6" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Post Types */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-3">Allowed Post Types</Text>
        <View className="flex-row flex-wrap">
          {postTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              className={`p-3 rounded-2xl mr-3 mb-3 border ${
                formData.allowedPostTypes.includes(type.id)
                  ? 'bg-purple-600/20 border-purple-500/50'
                  : 'bg-gray-800/60 border-gray-700/50'
              }`}
              onPress={() => togglePostType(type.id)}
            >
              <View className="items-center">
                <Feather 
                  name={type.icon} 
                  size={20} 
                  color={formData.allowedPostTypes.includes(type.id) ? type.color : '#9CA3AF'} 
                />
                <Text className={`text-xs mt-1 ${
                  formData.allowedPostTypes.includes(type.id) ? 'text-purple-300' : 'text-gray-400'
                }`}>
                  {type.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Allowed Clans */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-3">Allowed Clans</Text>
        <View className="flex-row flex-wrap">
          {clans.map((clan) => (
            <TouchableOpacity
              key={clan.id}
              className={`p-3 rounded-2xl mr-3 mb-3 border ${
                formData.allowedClanIds.includes(clan.id)
                  ? 'bg-purple-600/20 border-purple-500/50'
                  : 'bg-gray-800/60 border-gray-700/50'
              }`}
              onPress={() => toggleClan(clan.id)}
            >
              <View className="items-center">
                <Feather 
                  name={clan.icon} 
                  size={20} 
                  color={formData.allowedClanIds.includes(clan.id) ? clan.color : '#9CA3AF'} 
                />
                <Text className={`text-xs mt-1 ${
                  formData.allowedClanIds.includes(clan.id) ? 'text-purple-300' : 'text-gray-400'
                }`}>
                  {clan.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Allowed Committees */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-3">Allowed Committees</Text>
        <View className="flex-row flex-wrap">
          {committees.map((committee) => (
            <TouchableOpacity
              key={committee.id}
              className={`p-3 rounded-2xl mr-3 mb-3 border ${
                formData.allowedCommitteeIds.includes(committee.id)
                  ? 'bg-purple-600/20 border-purple-500/50'
                  : 'bg-gray-800/60 border-gray-700/50'
              }`}
              onPress={() => toggleCommittee(committee.id)}
            >
              <View className="items-center">
                <Feather 
                  name={committee.icon} 
                  size={20} 
                  color={formData.allowedCommitteeIds.includes(committee.id) ? committee.color : '#9CA3AF'} 
                />
                <Text className={`text-xs mt-1 ${
                  formData.allowedCommitteeIds.includes(committee.id) ? 'text-purple-300' : 'text-gray-400'
                }`}>
                  {committee.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Clan Zone Section Toggle */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-3">Clan Zone</Text>
        <View className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white font-medium">Enable Clan Zone</Text>
              <Text className="text-gray-400 text-sm">Special section for clan challenges and events</Text>
            </View>
            <Switch
              value={formData.enabledSections.clanZone}
              onValueChange={() => toggleSection('clanZone')}
              trackColor={{ false: '#374151', true: '#8B5CF6' }}
              thumbColor={formData.enabledSections.clanZone ? '#ffffff' : '#9CA3AF'}
            />
          </View>
        </View>
      </View>

      {/* Moderation Settings */}
      <View className="mb-6">
        <Text className="text-white text-sm font-medium mb-3">Moderation</Text>
        
        <View className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white font-medium">Auto Moderation</Text>
              <Text className="text-gray-400 text-sm">Automatically filter spam and inappropriate content</Text>
            </View>
            <Switch
              value={formData.isModerated}
              onValueChange={(value) => updateFormData('isModerated', value)}
              trackColor={{ false: '#374151', true: '#8B5CF6' }}
              thumbColor={formData.isModerated ? '#ffffff' : '#9CA3AF'}
            />
          </View>
        </View>

        <View className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white font-medium">Require Approval</Text>
              <Text className="text-gray-400 text-sm">Members need approval before joining</Text>
            </View>
            <Switch
              value={formData.requireApprovalForJoin}
              onValueChange={(value) => updateFormData('requireApprovalForJoin', value)}
              trackColor={{ false: '#374151', true: '#8B5CF6' }}
              thumbColor={formData.requireApprovalForJoin ? '#ffffff' : '#9CA3AF'}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderReview = () => (
    <View className="px-6">
      <Text className="text-white text-2xl font-bold mb-6">Review & Create</Text>
      
      {/* Community Preview */}
      <View className="bg-gray-800/60 rounded-3xl border border-gray-700/50 p-6 mb-6">
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 bg-gray-700 rounded-2xl items-center justify-center mr-4">
            <Text className="text-2xl">🏛️</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">{formData.name || 'Community Name'}</Text>
            <Text className="text-gray-400">{formData.slogan || 'Community Slogan'}</Text>
          </View>
        </View>
        
        <Text className="text-gray-300 mb-4">{formData.description || 'Community description...'}</Text>
        
        <View className="flex-row flex-wrap mb-4">
          {formData.tags.map((tag, index) => (
            <View key={index} className="bg-purple-600/20 border border-purple-500/30 rounded-full px-3 py-1 mr-2 mb-2">
              <Text className="text-purple-300 text-sm">{tag}</Text>
            </View>
          ))}
        </View>
        
        <View className="flex-row items-center">
          <Feather name="users" size={16} color="#9CA3AF" />
          <Text className="text-gray-400 text-sm ml-2">0 members</Text>
          <Text className="text-gray-400 text-sm mx-2">•</Text>
          <Text className="text-gray-400 text-sm capitalize">{formData.visibility}</Text>
        </View>
      </View>

      {/* Summary */}
      <View className="space-y-4">
        <View className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-4">
          <Text className="text-white font-medium mb-2">Post Types Enabled</Text>
          <Text className="text-gray-400 text-sm">{formData.allowedPostTypes.length} types selected</Text>
        </View>
        
        <View className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-4">
          <Text className="text-white font-medium mb-2">Allowed Clans</Text>
          <Text className="text-gray-400 text-sm">
            {formData.allowedClanIds.length > 0 
              ? `${formData.allowedClanIds.length} clans selected` 
              : 'No clans selected'}
          </Text>
        </View>
        
        <View className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-4">
          <Text className="text-white font-medium mb-2">Allowed Committees</Text>
          <Text className="text-gray-400 text-sm">
            {formData.allowedCommitteeIds.length > 0 
              ? `${formData.allowedCommitteeIds.length} committees selected` 
              : 'No committees selected'}
          </Text>
        </View>
        
        <View className="bg-gray-800/60 rounded-2xl border border-gray-700/50 p-4">
          <Text className="text-white font-medium mb-2">Moderation</Text>
          <Text className="text-gray-400 text-sm">
            {formData.isModerated ? 'Auto-moderation enabled' : 'Manual moderation only'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderBasicInfo();
      case 1: return renderCustomize();
      case 2: return renderSettings();
      case 3: return renderReview();
      default: return renderBasicInfo();
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#9333EA', '#9333EA', '#1F2937', '#000000', '#000000']}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
      >
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4">
            <TouchableOpacity 
              className="w-10 h-10 bg-gray-800/60 rounded-full items-center justify-center border border-gray-700/50"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            
            <Text className="text-white text-lg font-semibold">Create Community</Text>
            
            <View className="w-10 h-10" />
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Content */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <Animated.View 
              className="flex-row"
              style={{
                width: width * steps.length,
                transform: [{ translateX: slideAnim }],
              }}
            >
              {steps.map((_, index) => (
                <View key={index} style={{ width }}>
                  {index === currentStep && renderCurrentStep()}
                </View>
              ))}
            </Animated.View>
            
            <View className="h-24" />
          </ScrollView>

          {/* Bottom Navigation */}
          <View className="px-6 py-4 bg-gray-900/90 border-t border-gray-700/50">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                className={`flex-1 mr-3 py-4 rounded-2xl items-center ${
                  currentStep === 0 
                    ? 'bg-gray-700/50' 
                    : 'bg-gray-800/60 border border-gray-700/50'
                }`}
                onPress={prevStep}
                disabled={currentStep === 0}
              >
                <Text className={`font-medium ${
                  currentStep === 0 ? 'text-gray-500' : 'text-white'
                }`}>
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 ml-3 py-4 rounded-2xl items-center bg-purple-600"
                onPress={currentStep === steps.length - 1 ? handleSubmit : nextStep}
              >
                <Text className="text-white font-medium">
                  {currentStep === steps.length - 1 ? 'Create Community' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}