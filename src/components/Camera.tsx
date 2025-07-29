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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      } catch (err) {
        console.error("Camera error:", err);
        onClose();
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onClose]);

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    
    // Stop camera stream immediately after capture
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
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

  const handleRetake = () => {
    setCapturedImage(null);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
      })
      .catch(err => {
        console.error("Camera error on retake:", err);
        onClose();
      });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl">
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center">
          {!capturedImage ? (
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
          {!capturedImage ? (
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