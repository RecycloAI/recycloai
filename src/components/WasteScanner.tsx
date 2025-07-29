import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { scanService } from '@/lib/scanService';
import { useAuth } from '@/contexts/AuthContext';
import { Camera as CameraComponent } from '@/components/Camera';
import { Camera as CameraIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface ScanResult {
  material: string;
  category: string;
  confidence: number;
  instructions: string;
  binColor: string;
  recyclable: boolean;
}

export function WasteScanner() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  // Mock AI results
  const mockResults: ScanResult[] = [
    {
      material: "Plastic Bottle",
      category: "PET Plastic",
      confidence: 97,
      instructions: "Remove cap and label. Rinse thoroughly. Place in blue recycling bin.",
      binColor: "Blue",
      recyclable: true
    },
    {
      material: "Aluminum Can",
      category: "Aluminum",
      confidence: 95,
      instructions: "Rinse can to remove food residue. Place in blue recycling bin.",
      binColor: "Blue", 
      recyclable: true
    },
    {
      material: "Pizza Box",
      category: "Cardboard",
      confidence: 89,
      instructions: "Remove food scraps. If greasy, place in compost. If clean, recycle in blue bin.",
      binColor: "Blue/Brown",
      recyclable: true
    },
    {
      material: "Glass Jar",
      category: "Glass",
      confidence: 98,
      instructions: "Remove lid and rinse. Place in blue recycling bin.",
      binColor: "Blue",
      recyclable: true
    }
  ];

  const handleUploadComplete = async (imagePath: string) => {
    try {
      // Get public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('waste-images')
        .getPublicUrl(imagePath);
      
      // Set the image for display
      setSelectedImage(publicUrl);
      
      // Create a File object from the URL for analysis
      const response = await fetch(publicUrl);
      const blob = await response.blob();
      const file = new File([blob], imagePath.split('/').pop() || 'captured.jpg', {
        type: blob.type
      });
      setImageFile(file);
      
    } catch (error) {
      console.error('Error handling camera image:', error);
      toast({
        title: "Image error",
        description: "Could not process captured image",
        variant: "destructive",
      });
    }
  };

  const handleClassify = async (imagePath: string) => {
    try {
      setIsScanning(true);
      setScanResult(null);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('waste-images')
        .getPublicUrl(imagePath);

      // Call classification function
      const classification = await classifyWasteImage(publicUrl);
      
      // Update UI with results
      setScanResult(classification);
      toast({
        title: "Scan complete!",
        description: `Identified as ${classification.material} with ${classification.confidence}% confidence.`,
      });
    } catch (error) {
      console.error('Classification error:', error);
      toast({
        title: "Classification failed",
        description: "Could not classify image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setShowCamera(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanImage = async () => {
    if (!selectedImage || !imageFile) {
      toast({
        title: "No image selected",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to upload images.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      // Upload to Supabase (for file uploads)
      const imageUrl = await scanService.uploadImage(imageFile, user.id);
      if (!imageUrl) {
        throw new Error("Upload failed");
      }

      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock result
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      setScanResult(randomResult);

      toast({
        title: "Scan complete!",
        description: `Identified as ${randomResult.material} with ${randomResult.confidence}% confidence.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">AI Waste Scanner</h3>
        <p className="text-gray-600">Upload an image or take a photo to identify waste and get disposal instructions</p>
      </div>

      {/* Image Display Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        {selectedImage ? (
          <div className="text-center">
            <img 
              src={selectedImage} 
              alt="Selected waste item" 
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
            />
            <div className="mt-4 space-x-4">
              <Button 
                onClick={scanImage} 
                disabled={isScanning}
                className="bg-green-600 hover:bg-green-700"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Image'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedImage(null);
                  setScanResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isScanning}
              >
                Clear
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-4 text-lg font-medium text-gray-900">Upload waste image</h4>
            <p className="mt-2 text-gray-600">Select an image from your device or take a photo</p>
            <div className="mt-6 space-x-4">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              <Button 
                onClick={() => setShowCamera(true)}
                variant="outline"
              >
                <CameraIcon className="mr-2 h-4 w-4" />
                Use Camera
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CameraComponent 
          onUploadComplete={handleUploadComplete}
          onClassify={handleClassify}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Results Display */}
      {scanResult && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {scanResult.recyclable ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-orange-600" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">{scanResult.material}</h4>
              <p className="text-sm text-gray-600 mb-2">{scanResult.category}</p>
              <div className="mb-4">
                <span className="text-sm text-gray-500">Confidence: </span>
                <span className="font-medium text-gray-900">{scanResult.confidence}%</span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Disposal Instructions:</h5>
                <p className="text-gray-700 text-sm">{scanResult.instructions}</p>
                <div className="mt-3 flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Bin Color:</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    {scanResult.binColor}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    scanResult.recyclable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {scanResult.recyclable ? 'Recyclable' : 'Not Recyclable'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function classifyWasteImage(imageUrl: string): Promise<ScanResult> {
  // Mock implementation - replace with actual API call
  const mockResults = [
    {
      material: "Plastic Bottle",
      category: "PET Plastic",
      confidence: 97,
      instructions: "Remove cap and label. Rinse thoroughly. Place in blue recycling bin.",
      binColor: "Blue",
      recyclable: true
    },
    // ... other mock results
  ];
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockResults[Math.floor(Math.random() * mockResults.length)];
}