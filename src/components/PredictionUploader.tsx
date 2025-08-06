import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { Camera } from '@/components/Camera';
import { Camera as CameraIcon, Recycle, MapPin, Info, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

// Dynamically import the Map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Extended guidelines with global disposal information
const LABEL_GUIDELINES: Record<string, { instruction: string; globalTips: string }> = {
  "white-glass": {
    instruction: "Recycle in white-glass bin. Ensure it's clean.",
    globalTips: "Check local recycling programs - white glass is widely recycled but sorting requirements vary by municipality."
  },
  "trash": {
    instruction: "Dispose in general waste. Not recyclable.",
    globalTips: "Consider waste-to-energy facilities where available. In some countries, non-recyclables are incinerated for energy."
  },
  "shoes": {
    instruction: "Donate if usable. Otherwise dispose in trash.",
    globalTips: "Many brands offer shoe recycling programs (Nike, Adidas, etc.). Textile recycling bins may accept shoes in some cities."
  },
  "plastic": {
    instruction: "Recycle in plastics bin. Rinse before disposing.",
    globalTips: "Look for resin codes (1-7) to determine recyclability. Many developing countries only accept PET (1) and HDPE (2)."
  },
  "paper": {
    instruction: "Recycle in paper bin. Avoid soiled paper.",
    globalTips: "Asian countries often have extensive paper recycling. In Europe, separate colored and white paper for better recycling."
  },
  "metal": {
    instruction: "Recycle in metal bin. Rinse containers.",
    globalTips: "Aluminum is universally valuable to recycle. In some African countries, informal sectors pay for metal waste."
  },
  "green-glass": {
    instruction: "Recycle in green-glass bin. Clean it first.",
    globalTips: "Some countries separate glass by color while others mix. Check local rules - colored glass has lower recycling value."
  },
  "clothes": {
    instruction: "Donate if wearable. Otherwise dispose responsibly.",
    globalTips: "H&M and other retailers offer global clothing take-back programs. Some cities have textile recycling points."
  },
  "cardboard": {
    instruction: "Flatten and recycle in cardboard bin.",
    globalTips: "Highly recyclable worldwide. In some countries, informal collectors will pick up cardboard from homes."
  },
  "brown-glass": {
    instruction: "Recycle in brown-glass bin. Keep it clean.",
    globalTips: "Commonly accepted but check local rules. Brown glass has good recycling value for new bottles."
  },
  "biological": {
    instruction: "Dispose in organic/biodegradable waste.",
    globalTips: "Many European cities have organic waste collection. In tropical areas, home composting is highly effective."
  },
  "battery": {
    instruction: "Take to e-waste/battery recycling station.",
    globalTips: "Most electronics stores accept batteries globally. IKEA and supermarkets often have collection points."
  },
};

interface WasteScan {
  id?: number;
  user_id: string;
  waste_type: string;
  image_url: string;
  confidence?: number;
  created_at: string;
  co2_saved: number;
  points_earned: number;
}

interface UserImpactStats {
  user_id: string;
  total_scans: number;
  total_co2_saved: number;
  total_points: number;
  last_scan_at?: string;
}

interface RecyclingPoint {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  waste_types: string[];
  phone?: string;
  website?: string;
  hours?: string;
}

const API_BASE_URL = "http://127.0.0.1:8000";

const PredictionUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [predictedLabel, setPredictedLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<WasteScan[]>([]);
  const [userStats, setUserStats] = useState<UserImpactStats>({
    user_id: "",
    total_scans: 0,
    total_co2_saved: 0,
    total_points: 0
  });
  const [showDisposalInfo, setShowDisposalInfo] = useState(false);
  const [recyclingPoints, setRecyclingPoints] = useState<RecyclingPoint[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Sample recycling centers data with focus on Kenya
  const recyclingCenters: RecyclingPoint[] = [
    // Kenya
    {
      id: 1,
      name: "TakaTaka Solutions",
      address: "Mombasa Road, Nairobi, Kenya",
      latitude: -1.3182,
      longitude: 36.8172,
      waste_types: ["plastic", "paper", "metal", "glass", "cardboard"],
      phone: "+254 723 123456",
      website: "https://takataka.co.ke"
    },
    {
      id: 2,
      name: "Mr. Green Africa",
      address: "Enterprise Road, Nairobi, Kenya",
      latitude: -1.2921,
      longitude: 36.8219,
      waste_types: ["plastic", "metal", "battery"],
      phone: "+254 700 987654",
      website: "https://mrgreenafrica.com"
    },
    {
      id: 3,
      name: "Sanergy",
      address: "Mukuru, Nairobi, Kenya",
      latitude: -1.3028,
      longitude: 36.8766,
      waste_types: ["biological", "organic"],
      phone: "+254 733 456789"
    },
    {
      id: 4,
      name: "Gjenge Makers",
      address: "Ngong Road, Nairobi, Kenya",
      latitude: -1.3048,
      longitude: 36.7810,
      waste_types: ["plastic"],
      website: "https://gengemakers.org"
    },
    {
      id: 5,
      name: "Kiteezi Recycling Center",
      address: "Kampala, Uganda",
      latitude: 0.3476,
      longitude: 32.5825,
      waste_types: ["plastic", "paper", "metal"],
      phone: "+256 414 123456"
    },
    // Global centers
    {
      id: 6,
      name: "Recycle Now Center",
      address: "London, UK",
      latitude: 51.5074,
      longitude: -0.1278,
      waste_types: ["glass", "paper", "cardboard", "metal"],
      website: "https://recyclenow.com"
    },
    {
      id: 7,
      name: "Green Earth Recycling",
      address: "New York, USA",
      latitude: 40.7128,
      longitude: -74.0060,
      waste_types: ["plastic", "metal", "battery", "glass"],
      phone: "+1 212 555 1234"
    },
    {
      id: 8,
      name: "EcoRecycle Melbourne",
      address: "Melbourne, Australia",
      latitude: -37.8136,
      longitude: 144.9631,
      waste_types: ["plastic", "paper", "glass", "cardboard"],
      website: "https://ecorecycle.org.au"
    },
    {
      id: 9,
      name: "Green Africa Recycling",
      address: "Lagos, Nigeria",
      latitude: 6.5244,
      longitude: 3.3792,
      waste_types: ["plastic", "metal", "paper"],
      phone: "+234 812 345 6789"
    },
    {
      id: 10,
      name: "Waste Ventures India",
      address: "Mumbai, India",
      latitude: 19.0760,
      longitude: 72.8777,
      waste_types: ["plastic", "paper", "metal", "glass"],
      website: "https://wasteventuresindia.org"
    }
  ];

  // Fetch user's scan history and stats
  const fetchUserData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Get scan history from waste_scans table
      const { data: scans } = await supabase
        .from('waste_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (scans) setScanResults(scans);

      // Get user stats from user_impact_stats
      const { data: stats } = await supabase
        .from('user_impact_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (stats) setUserStats(stats);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const resetState = useCallback(() => {
    setPredictedLabel("");
    setError("");
  }, []);

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0];
  if (!selectedFile) return;

  resetState();
  setLoading(true);

  try {
    // Create preview URL
    const previewUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(previewUrl);
  } catch (err) {
    setError("Failed to process image");
    console.error(err);
  } finally {
    setLoading(false);
  }
};
const handleCameraUploadComplete = async (imagePath: string, imageData: string) => {
  try {
    // Create a file object from the data URL
    const response = await fetch(imageData);
    const blob = await response.blob();
    const file = new File([blob], "camera-capture.jpg", { type: blob.type });
    
    // Set the file and preview
    setFile(file);
    setPreviewUrl(imageData);
    
    // The Camera component already uploaded the image to Supabase
    const publicUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/waste-images/${imagePath}`;
    
    // Call analyze with both the File object and the public URL
    await handleAnalyze(file, publicUrl);
    
  } catch (err) {
    setError("Failed to process camera image");
    console.error(err);
  } finally {
    setShowCamera(false);
  }
};



const saveScanResult = async (
  result: Omit<WasteScan, 'id' | 'created_at'>,
  options?: {
    imageData?: string; // For when we need to upload
    imagePublicUrl?: string // For when camera already uploaded
  }
) => {
  // 1. Authentication Check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  try {
    // 2. Get Current Stats
    const { data: currentStats } = await supabase
      .from('user_impact_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 3. Calculate New Values
    const newTotalScans = (currentStats?.total_scans || 0) + 1;
    const newTotalCo2 = (currentStats?.total_co2_saved || 0) + result.co2_saved;
    const newTotalPoints = (currentStats?.total_points || 0) + result.points_earned;
    const newAvgCo2 = newTotalCo2 / newTotalScans;

    // 4. Update User Stats
    const { error: statsError } = await supabase
      .from('user_impact_stats')
      .upsert({
        user_id: user.id,
        total_scans: newTotalScans,
        total_co2_saved: newTotalCo2,
        total_points: newTotalPoints,
        avg_co2_per_scan: newAvgCo2,
        last_updated: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (statsError) throw statsError;

    // 5. Handle Image Upload (if needed)
    let imageUrl = options?.imagePublicUrl || result.image_url;
    
    if (options?.imageData && !imageUrl) {
      try {
        const blob = await fetch(options.imageData).then(res => res.blob());
        const filePath = `camera-uploads/${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('waste-images')
          .upload(filePath, blob, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (uploadError) throw uploadError;
        
        imageUrl = supabase.storage
          .from('waste-images')
          .getPublicUrl(filePath).data.publicUrl;
      } catch (uploadErr) {
        console.error("Image upload failed:", uploadErr);
        throw new Error("Failed to upload image");
      }
    }

    // 6. Save Scan Record
    const { data: scanData, error: scanError } = await supabase
      .from('waste_scans')
      .insert({
        user_id: user.id,
        waste_type: result.waste_type,
        image_url: imageUrl,
        confidence: result.confidence || 0.8,
        co2_saved: result.co2_saved,
        points_earned: result.points_earned
      })
      .select()
      .single();

    if (scanError) throw scanError;

    // 7. Update Derived Data
    await updateMostCommonWaste(user.id);
    await fetchUserData();

    // 8. Return Complete Scan Data
    return {
      ...scanData,
      // Ensure we always return the final image URL
      image_url: imageUrl 
    };

  } catch (err) {
    console.error("Error in saveScanResult:", err);
    throw err;
  }
};

const updateMostCommonWaste = async (userId: string) => {
  try {
    // Fetch all scans for the user
    const { data: scans, error } = await supabase
      .from('waste_scans')
      .select('waste_type')
      .eq('user_id', userId);

    if (error) throw error;

    if (scans && scans.length > 0) {
      // Group client-side
      const counts: Record<string, number> = {};
      scans.forEach(scan => {
        counts[scan.waste_type] = (counts[scan.waste_type] || 0) + 1;
      });

      // Find the most common waste type
      const mostCommon = Object.entries(counts).reduce(
        (acc, [wasteType, count]) => count > acc.count ? { wasteType, count } : acc,
        { wasteType: '', count: 0 }
      );

      if (mostCommon.wasteType) {
        await supabase
          .from('user_impact_stats')
          .update({ most_common_waste: mostCommon.wasteType })
          .eq('user_id', userId);
      }
    }
  } catch (err) {
    console.error("Error updating most common waste:", err);
  }
};

  const calculateEnvironmentalImpact = (wasteType: string) => {
    const impactMap: Record<string, { co2: number; points: number }> = {
      "white-glass": { co2: 0.3, points: 5 },
      "trash": { co2: 0, points: 0 },
      "plastic": { co2: 0.5, points: 8 },
      "paper": { co2: 0.4, points: 7 },
      "metal": { co2: 0.6, points: 10 },
      "green-glass": { co2: 0.3, points: 5 },
      "clothes": { co2: 0.2, points: 3 },
      "cardboard": { co2: 0.4, points: 7 },
      "brown-glass": { co2: 0.3, points: 5 },
      "biological": { co2: 0.1, points: 2 },
      "battery": { co2: 0.7, points: 12 },
      "shoes": { co2: 0.2, points: 3 }
    };

    return impactMap[wasteType] || { co2: 0.2, points: 3 };
  };

const handleAnalyze = async (customFile?: File, customPublicUrl?: string) => {
  const fileToUse = customFile || file;
  const publicUrlToUse = customPublicUrl || previewUrl;

  if (!fileToUse) {
    setError("Please upload an image first.");
    return;
  }

  setLoading(true);
  resetState();

  try {
    // Step 1: Prepare FormData
    const formData = new FormData();
    formData.append("file", fileToUse);

    // Step 2: Send to prediction API
    const response = await axios.post(
      `${API_BASE_URL}/predict`,
      formData,
      {
        headers: {
          "accept": "application/json",
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000,
      }
    );

    const { predicted_label, confidence = 0.8 } = response.data;
    setPredictedLabel(predicted_label);

    if (!predicted_label) {
      throw new Error("No prediction result returned from the API");
    }

    // Step 3: Handle image URL
    let finalPublicUrl = publicUrlToUse;
    
    // If we have a blob URL (from file input), we need to upload it
    if (previewUrl?.startsWith('blob:')) {
      const fileExt = fileToUse.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `user-uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('waste-images')
        .upload(filePath, fileToUse);

      if (uploadError) throw uploadError;

      finalPublicUrl = supabase.storage
        .from('waste-images')
        .getPublicUrl(filePath).data.publicUrl;
      
      setPreviewUrl(finalPublicUrl);
    }

    // Step 4: Save results
    const { co2, points } = calculateEnvironmentalImpact(predicted_label);
    const scanResult = await saveScanResult({
      user_id: (await supabase.auth.getUser()).data.user?.id || '',
      waste_type: predicted_label,
      image_url: finalPublicUrl,
      confidence: Number(confidence),
      co2_saved: co2,
      points_earned: points
    });

    // Update state
    setScanResults(prev => [scanResult, ...prev]);
    setUserStats(prev => ({
      ...prev,
      total_scans: prev.total_scans + 1,
      total_co2_saved: prev.total_co2_saved + co2,
      total_points: prev.total_points + points
    }));

  } catch (err: any) {
    let errorMessage = "Error analyzing image";
    
    if (err.response) {
      if (err.response.status === 422) {
        errorMessage = "Invalid image format. Please try a JPEG, PNG, or WEBP image.";
      } else if (err.response.status === 413) {
        errorMessage = "Image file is too large. Please use a smaller image.";
      } else {
        errorMessage = err.response.data?.detail || `Server error (${err.response.status})`;
      }
    } else if (err.code === "ECONNABORTED") {
      errorMessage = "Request timed out. Please try again.";
    } else if (err.message) {
      errorMessage = err.message;
    }

    setError(errorMessage);
    console.error("Analysis error:", err);

    // Reset state if it's not a camera capture
    if (!customFile) {
      setPreviewUrl(null);
      setFile(null);
    }
  } finally {
    setLoading(false);
  }
};

  const handleReset = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    resetState();
  };

  const handleShowDisposalInfo = async () => {
    try {
      setLocationError(null);
      
      // First try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            
            // Filter points that accept the current waste type and are within reasonable distance
            const filteredPoints = recyclingCenters.filter(point => {
              const acceptsWasteType = predictedLabel 
                ? point.waste_types.includes(predictedLabel)
                : true;
              
              // Simple distance calculation (for demo purposes)
              const distance = Math.sqrt(
                Math.pow(point.latitude - latitude, 2) + 
                Math.pow(point.longitude - longitude, 2)
              );
              
              return acceptsWasteType && distance < 5; // Within ~5 degrees (simplified for demo)
            });
            
            setRecyclingPoints(filteredPoints.length > 0 ? filteredPoints : recyclingCenters);
            setShowDisposalInfo(true);
          },
          (error) => {
            console.warn("Geolocation error:", error);
            setLocationError("Could not get your location. Showing all recycling centers.");
            
            // Fallback to showing all centers that accept this waste type
            const filteredPoints = predictedLabel 
              ? recyclingCenters.filter(point => point.waste_types.includes(predictedLabel))
              : recyclingCenters;
            
            setUserLocation({ lat: -1.2921, lng: 36.8219 }); // Default to Nairobi
            setRecyclingPoints(filteredPoints);
            setShowDisposalInfo(true);
          }
        );
      } else {
        // Browser doesn't support Geolocation
        setLocationError("Geolocation not supported. Showing all recycling centers.");
        
        const filteredPoints = predictedLabel 
          ? recyclingCenters.filter(point => point.waste_types.includes(predictedLabel))
          : recyclingCenters;
        
        setUserLocation({ lat: -1.2921, lng: 36.8219 }); // Default to Nairobi
        setRecyclingPoints(filteredPoints);
        setShowDisposalInfo(true);
      }
    } catch (err) {
      console.error("Error getting location:", err);
      setLocationError("Error loading location data. Showing all recycling centers.");
      setUserLocation({ lat: -1.2921, lng: 36.8219 }); // Default to Nairobi
      setRecyclingPoints(recyclingCenters);
      setShowDisposalInfo(true);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Left side - Classifier */}
      <div className="w-full md:w-1/2 bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700 flex items-center justify-center gap-2">
          <Recycle className="h-6 w-6" /> Waste Classifier
        </h2>
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setShowCamera(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CameraIcon className="h-5 w-5" />
              Use Camera
            </button>
            <label className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <span>Upload File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {previewUrl && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-48 object-contain"
                onLoad={() => {
                  // Only revoke object URLs (for camera data URLs), not Supabase URLs
                  if (previewUrl.startsWith('blob:') || previewUrl.startsWith('data:')) {
                    URL.revokeObjectURL(previewUrl);
                  }
                }}
              />
              <div className="p-3 bg-gray-50 flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate">
                  {file?.name || "Camera Capture"}
                </span>
                <button 
                  onClick={handleReset}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => handleAnalyze()}
          disabled={loading || !file}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
            loading || !file 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium text-center">{error}</p>
          </div>
        )}

        {predictedLabel && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Analysis Result
            </h3>
            <p className="font-medium text-gray-800">
              Type: <span className="capitalize">{predictedLabel.replace('-', ' ')}</span>
            </p>
            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
              <p className="text-sm text-gray-700">
                {LABEL_GUIDELINES[predictedLabel]?.instruction || "No specific guidelines available."}
              </p>
            </div>
            <button
              onClick={handleShowDisposalInfo}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <MapPin className="h-4 w-4" />
              Show disposal guidance for your area
            </button>
          </div>
        )}
      </div>

      {/* Right side - Results and Stats */}
      <div className="w-full md:w-1/2 space-y-6">
        {/* User Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-700">Your Impact</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-green-600">Total Scans</p>
              <p className="text-2xl font-bold">{userStats.total_scans}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-600">CO₂ Saved</p>
              <p className="text-2xl font-bold">{userStats.total_co2_saved.toFixed(2)} kg</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-purple-600">Points Earned</p>
              <p className="text-2xl font-bold">{userStats.total_points}</p>
            </div>
          </div>
        </div>

        {/* Scan History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-700">Recent Scans</h3>
          {scanResults.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {scanResults.map((scan) => (
                <div key={scan.id} className="border-b pb-3 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <img 
                      src={scan.image_url} 
                      alt={scan.waste_type} 
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium capitalize">{scan.waste_type.replace('-', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(scan.created_at).toLocaleString()}
                      </p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          +{scan.points_earned} pts
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {scan.co2_saved.toFixed(2)} kg CO₂
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No scan history yet</p>
          )}
        </div>
      </div>

      {/* Disposal Info Modal */}
      {showDisposalInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Disposal Guidance
              </h3>
              <button 
                onClick={() => setShowDisposalInfo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Standard Instruction:</h4>
                <p className="text-sm bg-gray-50 p-3 rounded">
                  {LABEL_GUIDELINES[predictedLabel]?.instruction || "Dispose according to local regulations."}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-1 flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Global Tips:
                </h4>
                <p className="text-sm bg-blue-50 p-3 rounded">
                  {LABEL_GUIDELINES[predictedLabel]?.globalTips || "Check with your local waste management authority."}
                </p>
              </div>

              {locationError && (
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded text-sm">
                  {locationError}
                </div>
              )}

              {userLocation && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Nearby Recycling Points:
                  </h4>
                  <div className="h-64 rounded-lg overflow-hidden border">
                    <MapContainer
                      center={[userLocation.lat, userLocation.lng]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {/* User location marker */}
                      <Marker position={[userLocation.lat, userLocation.lng]}>
                        <Popup>Your Location</Popup>
                      </Marker>
                      {/* Recycling points markers */}
                      {recyclingPoints.map((point) => (
                        <Marker 
                          key={point.id}                           position={[point.latitude, point.longitude]}
                        >
                          <Popup>
                            <div className="space-y-1">
                              <h5 className="font-semibold">{point.name}</h5>
                              <p className="text-sm">{point.address}</p>
                              <div className="mt-1">
                                <p className="text-xs font-medium text-gray-600">
                                  Accepts: {point.waste_types.join(', ')}
                                </p>
                                {point.phone && (
                                  <p className="text-xs mt-1">
                                    Phone: <a href={`tel:${point.phone}`} className="text-blue-600">{point.phone}</a>
                                  </p>
                                )}
                                {point.website && (
                                  <p className="text-xs mt-1">
                                    Website: <a href={point.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">{point.website}</a>
                                  </p>
                                )}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recyclingPoints.map((point) => (
                      <div key={point.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <h5 className="font-medium">{point.name}</h5>
                        <p className="text-sm text-gray-600">{point.address}</p>
                        <p className="text-xs mt-1">
                          <span className="font-medium">Accepts:</span> {point.waste_types.join(', ')}
                        </p>
                        {point.phone && (
                          <p className="text-xs mt-1">
                            <span className="font-medium">Phone:</span> {point.phone}
                          </p>
                        )}
                        {point.website && (
                          <p className="text-xs mt-1">
                            <span className="font-medium">Website:</span>{" "}
                            <a href={point.website} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                              {point.website}
                            </a>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  Note: Disposal methods may vary by location. Always check with local authorities for the most accurate information.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <Camera
          onUploadComplete={handleCameraUploadComplete}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default PredictionUploader;