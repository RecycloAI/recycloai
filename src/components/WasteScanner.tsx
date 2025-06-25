import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { scanService } from '@/lib/scanService';
import { useAuth } from '@/contexts/AuthContext';

interface ScanResult {
  material: string;
  category: string;
  confidence: number;
  instructions: string;
  binColor: string;
  recyclable: boolean;
}

const WasteScanner = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Mock AI results for demo purposes
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

    // Upload to Supabase
    const imageUrl = await scanService.uploadImage(imageFile, user.id);
    if (!imageUrl) {
      toast({
        title: "Upload failed",
        description: "Could not upload image. Please try again.",
        variant: "destructive",
      });
      setIsScanning(false);
      return;
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI result (randomly select one)
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    setScanResult(randomResult);
    setIsScanning(false);

    toast({
      title: "Scan complete!",
      description: `Identified as ${randomResult.material} with ${randomResult.confidence}% confidence.`,
    });
  };

  const handleCameraCapture = () => {
    // In a real app, this would open camera
    toast({
      title: "Camera feature",
      description: "Camera capture would be implemented with getUserMedia API.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">AI Waste Scanner</h3>
        <p className="text-gray-600">Upload an image or take a photo to identify waste and get disposal instructions</p>
      </div>

      {/* Upload Section */}
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
                onClick={handleCameraCapture}
                variant="outline"
              >
                <Camera className="mr-2 h-4 w-4" />
                Use Camera
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Results Section */}
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
};

export default WasteScanner;
