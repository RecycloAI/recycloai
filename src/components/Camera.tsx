import { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';

interface CameraProps {
  onUploadComplete: (imagePath: string) => void;
  onClose: () => void;
}

export const Camera = ({ onUploadComplete, onClose }: CameraProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Prefer rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => {
            console.error("Video play error:", err);
            setCameraError("Failed to start camera");
          });
        };
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Could not access camera. Please check permissions.");
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
    } catch (err) {
      console.error("Capture error:", err);
      setCameraError("Failed to capture image");
    }
  };

  const uploadImage = async (imageData: string) => {
    try {
      setIsUploading(true);
      const blob = await fetch(imageData).then(res => res.blob());
      const fileExt = 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `camera-uploads/${fileName}`;

      const { error } = await supabase.storage
        .from('waste-images')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;
      return filePath;
    } catch (error) {
      console.error('Upload error:', error);
      setCameraError("Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!capturedImage) return;
    
    const imagePath = await uploadImage(capturedImage);
    if (imagePath) {
      onUploadComplete(imagePath);
      onClose();
    }
  };

  const handleRetake = async () => {
    setCapturedImage(null);
    setCameraError(null);
    await startCamera();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl">
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center">
          {cameraError ? (
            <div className="text-white p-4 text-center">
              <p className="text-red-400 font-medium">{cameraError}</p>
              <Button 
                onClick={startCamera}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          ) : !capturedImage ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
              muted
            />
          ) : (
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-contain"
            />
          )}
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          {cameraError ? (
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          ) : !capturedImage ? (
            <div className="flex gap-3 justify-between">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={captureImage}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <CameraIcon className="w-4 h-4 mr-2" />
                Capture
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 justify-between">
              <Button 
                variant="outline" 
                onClick={handleRetake}
                disabled={isUploading}
                className="flex-1"
              >
                Retake
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={isUploading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};