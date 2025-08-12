import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Loader2, UploadCloud, CheckCircle2, XCircle, Edit, Save, X, Leaf, Scan, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  total_scans: number;
  co2_saved: number;
  points: number;
  created_at: string;
  updated_at: string;
  bio: string;
  avatar_url: string | null;
  location: string;
  most_common_waste: string | null;
  avg_co2_per_scan: number | null;
}

export default function UserProfile() {
  const { user, refreshUser = async () => {} } = useAuth(); // Provide default function if not available
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<Omit<ProfileData, 'id' | 'created_at' | 'updated_at' | 'total_scans' | 'co2_saved' | 'points' | 'most_common_waste' | 'avg_co2_per_scan'>>({
    name: '',
    email: '',
    bio: '',
    avatar_url: null,
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [rank, setRank] = useState<number | null>(null);

  // Get the properly formatted avatar URL with cache busting
  const getAvatarUrl = (url: string | null) => {
    if (!url) return null;
    // If it's already a full URL (from Supabase storage), just add cache busting
    if (url.startsWith('http')) {
      return `${url}?t=${new Date().getTime()}`;
    }
    // If it's a relative path, construct the full URL
    return `${supabase.storage.from('avatars').getPublicUrl(url).data.publicUrl}?t=${new Date().getTime()}`;
  };

  // Fetch profile data and rank
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Fetch profile data
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        // If no profile exists, this is a new user
        if (!data) {
          setIsNewUser(true);
          setIsEditing(true);
          setFormData({
            name: '',
            email: user.email || '',
            bio: '',
            avatar_url: null,
            location: '',
          });
          setLoading(false);
          return;
        }

        // Fetch user rank based on points
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('points', data.points || 0);

        setProfile(data);
        setIsNewUser(false);
        setFormData({
          name: data.name || '',
          email: data.email || user.email || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url,
          location: data.location || '',
        });
        setRank(count ? count + 1 : null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      setUploading(true);
      setError('');
      setSuccessMessage('');

      // Delete old avatar if exists
      if (formData.avatar_url) {
        const oldAvatarPath = formData.avatar_url.split('/').pop();
        if (oldAvatarPath) {
          await supabase.storage.from('avatars').remove([oldAvatarPath]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update form data with the new URL
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));

      setSuccessMessage('Avatar updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (isNewUser) {
        // Create new profile for new user
        const { data, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: formData.name,
            email: formData.email,
            bio: formData.bio,
            location: formData.location,
            avatar_url: formData.avatar_url,
            total_scans: 0,
            co2_saved: 0,
            points: 0,
          })
          .select()
          .single();

        if (createError) throw createError;

        setProfile(data);
        setIsNewUser(false);
      } else {
        // Update existing profile
        const { data, error: updateError } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            email: formData.email,
            bio: formData.bio,
            location: formData.location,
            avatar_url: formData.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        setProfile(data);
      }

      // Update auth email if it's changed
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });

        if (emailError) throw emailError;
      }

      setIsEditing(false);
      if (refreshUser) {
        await refreshUser();
      }
      setSuccessMessage(isNewUser ? 'Profile created successfully!' : 'Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8 space-y-4">
        <h2 className="text-xl font-semibold">Your Profile</h2>
        <p className="text-gray-500">Please sign in to view your profile</p>
      </div>
    );
  }

  // For new users, show the edit form immediately
  if (isNewUser) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
        </div>
        
        {error && (
          <div className="p-4 rounded-md bg-red-50 text-red-800">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Avatar */}
          <div className="space-y-4 w-full md:w-1/3">
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage 
                    src={getAvatarUrl(formData.avatar_url) || undefined}
                    alt="Profile picture"
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-4xl font-medium">
                    {formData.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="relative">
                  <Button asChild variant="outline" disabled={uploading}>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mr-2 h-4 w-4" />
                          Add Avatar
                        </>
                      )}
                    </Label>
                  </Button>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={200}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us about yourself and your sustainability goals..."
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bio.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
                maxLength={50}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Complete Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8 space-y-4">
        <h2 className="text-xl font-semibold">Your Profile</h2>
        <p className="text-gray-500">
          {error || 'No profile data available'}
        </p>
      </div>
    );
  }

  // Calculate derived values
  const memberSince = new Date(profile.created_at);
  const daysAsMember = Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24));
  const scansPerDay = daysAsMember > 0 ? (profile.total_scans / daysAsMember).toFixed(1) : profile.total_scans;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Profile</h2>
        {!isEditing ? (
          <Button onClick={toggleEditMode} variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <Button onClick={toggleEditMode} variant="outline" className="text-red-600">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        )}
      </div>
      
      {/* Success/Error Messages */}
      {(successMessage || error) && (
        <div className={`p-4 rounded-md ${successMessage ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center gap-2">
            {successMessage ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <p>{successMessage}</p>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" />
                <p>{error}</p>
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - Avatar and Stats */}
        <div className="space-y-4 w-full md:w-1/3">
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage 
                  src={getAvatarUrl(formData.avatar_url) || undefined}
                  alt="Profile picture"
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-4xl font-medium">
                  {formData.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {isEditing && (
                <div className="relative">
                  <Button asChild variant="outline" disabled={uploading}>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="mr-2 h-4 w-4" />
                          Change Avatar
                        </>
                      )}
                    </Label>
                  </Button>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Your Impact</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Scan className="h-4 w-4 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                </div>
                <p className="text-xl font-bold mt-1">{profile.total_scans}</p>
                <p className="text-xs text-muted-foreground">{scansPerDay} per day</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                </div>
                <p className="text-xl font-bold mt-1">{profile.co2_saved.toFixed(2)} kg</p>
                <p className="text-xs text-muted-foreground">
                  {profile.avg_co2_per_scan ? `${profile.avg_co2_per_scan.toFixed(2)} kg/scan` : ''}
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm text-muted-foreground">Points</p>
                </div>
                <p className="text-xl font-bold mt-1">{profile.points}</p>
                <p className="text-xs text-muted-foreground">
                  {rank ? `Rank #${rank}` : 'Unranked'}
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-xl font-bold mt-1">
                  {memberSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {daysAsMember} days
                </p>
              </div>
            </div>
          </div>

          {profile.most_common_waste && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Most Common Waste</p>
              <p className="text-xl font-bold capitalize mt-1">
                {profile.most_common_waste.replace(/_/g, ' ')}
              </p>
              <Progress 
                value={75} // This could be dynamic based on actual percentage
                className="h-2 mt-2 bg-gray-200"
              />
            </div>
          )}
        </div>

        {/* Right Column - Display or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={200}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us about yourself and your sustainability goals..."
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bio.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="City, Country"
                maxLength={50}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={toggleEditMode}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm">{profile.email}</p>
            </div>

            <div className="space-y-2">
              <Label>Display Name</Label>
              <p className="text-sm">{profile.name || 'Not specified'}</p>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <p className="text-sm whitespace-pre-line">
                {profile.bio || 'No bio provided'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <p className="text-sm">{profile.location || 'Not specified'}</p>
            </div>

            <div className="space-y-2">
              <Label>Account Details</Label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p>{memberSince.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>{new Date(profile.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}