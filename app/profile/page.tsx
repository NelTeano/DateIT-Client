'use client';
import React, { useState, useEffect } from 'react';
import { User, Camera, Edit2, Save, X, LogOut } from 'lucide-react';
import MobileNav from '../components/mobile-nav/mobile-nav';
import Header from '../components/header/header';

export default function ProfilePage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    age: '',
    bio: '',
    photoUrl: '',
    gender: '',
    findGender: ''
  });

  const API_URL = `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/users`;

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
    const authToken = localStorage.getItem('authToken');
    setToken(authToken);
  }, []);

  // Load user profile on component mount
  useEffect(() => {
    if (mounted && token) {
      loadUserProfile();
    }
  }, [mounted, token]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load profile');
      }

      setProfileData({
        name: data.name || '',
        email: data.email || '',
        age: data.age?.toString() || '',
        bio: data.bio || '',
        photoUrl: data.photoUrl || '',
        gender: data.gender || '',
        findGender: data.findGender || ''
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    setError('');
    setSuccessMessage('');

    if (!profileData.name || !profileData.gender || !profileData.findGender) {
      setError('Name, gender, and preference are required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileData.name,
          age: profileData.age ? parseInt(profileData.age) : undefined,
          bio: profileData.bio || undefined,
          photoUrl: profileData.photoUrl || undefined,
          gender: profileData.gender,
          findGender: profileData.findGender
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      // Update localStorage with new user details
      const userDetails = localStorage.getItem('userDetails');
      if (userDetails) {
        const parsed = JSON.parse(userDetails);
        const updated = {
          ...parsed,
          name: data.user.name,
          age: data.user.age,
          bio: data.user.bio,
          photoUrl: data.user.photoUrl,
          gender: data.user.gender,
          findGender: data.user.findGender
        };
        localStorage.setItem('userDetails', JSON.stringify(updated));
      }

      setSuccessMessage('Profile updated successfully!');
      setIsEditMode(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
  const file = e.target.files?.[0];
  if (file) {
    setError('');
    setIsLoading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      
      // ✅ Remove Authorization header - upload works without auth
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/upload`, {
        method: 'POST',
        // No headers needed!
        body: form,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      handleInputChange('photoUrl', data.data.secureUrl);
      setSuccessMessage('Photo uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Image upload failed. Try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }
};
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userDetails');
    window.location.href = '/auth';
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setError('');
    setSuccessMessage('');
    loadUserProfile();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto py-8">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
              <div className="px-8 pb-8">
                <div className="relative -mt-16 mb-6">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gray-200 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your profile</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto py-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Cover Photo */}
            <div className="h-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

            <div className="px-8 pb-8">
              {/* Profile Photo */}
              <div className="relative -mt-16 mb-6">
                <div className="relative inline-block">
                  {profileData.photoUrl ? (
                    <img
                      src={profileData.photoUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  {isEditMode && (
                    <label className="absolute bottom-0 right-0 bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={isLoading}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>

                <div className="flex gap-3">
                  {!isEditMode ? (
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition shadow-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <Save className="w-4 h-4" />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 text-center">{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              {/* Profile Information */}
              {isLoading && !isEditMode ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profile...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name {isEditMode && <span className="text-red-500">*</span>}
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                        placeholder="John Doe"
                      />
                    ) : (
                      <p className="text-lg text-gray-800 font-semibold">{profileData.name || 'Not set'}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <p className="text-lg text-gray-800">{profileData.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I am {isEditMode && <span className="text-red-500">*</span>}
                    </label>
                    {isEditMode ? (
                      <select
                        value={profileData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                        required
                      >
                        <option value="">Select your gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-lg text-gray-800 capitalize">{profileData.gender || 'Not set'}</p>
                    )}
                  </div>

                  {/* Gender Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      I'm interested in {isEditMode && <span className="text-red-500">*</span>}
                    </label>
                    {isEditMode ? (
                      <select
                        value={profileData.findGender}
                        onChange={(e) => handleInputChange('findGender', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                        required
                      >
                        <option value="">Select preference</option>
                        <option value="male">Men</option>
                        <option value="female">Women</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Other</option>
                        <option value="everyone">Everyone</option>
                      </select>
                    ) : (
                      <p className="text-lg text-gray-800 capitalize">
                        {profileData.findGender === 'everyone' ? 'Everyone' : profileData.findGender || 'Not set'}
                      </p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    {isEditMode ? (
                      <input
                        type="number"
                        value={profileData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                        placeholder="25"
                        min="13"
                        max="120"
                      />
                    ) : (
                      <p className="text-lg text-gray-800">{profileData.age || 'Not set'}</p>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    {isEditMode ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition resize-none"
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-lg text-gray-800 whitespace-pre-wrap">{profileData.bio || 'No bio added yet'}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileNav />

      <div className="fixed top-20 left-10 w-20 h-20 bg-pink-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
    </div>
  );
}