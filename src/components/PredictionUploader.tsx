import React, { useState, useCallback } from "react";
import axios from "axios";
import { Camera } from '@/components/Camera';
import { Camera as CameraIcon } from 'lucide-react';

const LABEL_GUIDELINES: Record<string, string> = {
  "cardboard": "Flatten and recycle in the cardboard bin.",
  "glass": "Recycle in the glass bin. Ensure it's clean.",
  "metal": "Recycle in the metals bin. Rinse containers if needed.",
  "paper": "Recycle in the paper bin. Avoid wet or soiled paper.",
  "plastic": "Recycle in the plastics bin. Rinse before disposing.",
  "trash": "Dispose in the general waste bin. Not recyclable.",
};


const API_BASE_URL = "http://127.0.0.1:8000";

const PredictionUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [predictedLabel, setPredictedLabel] = useState("");
  const [guideline, setGuideline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setPredictedLabel("");
    setGuideline("");
    setError("");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    resetState();
    
    // Create and cleanup preview URL
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleCameraUploadComplete = async (imagePath: string) => {
    try {
      const response = await fetch(
        `https://${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/waste-images/${imagePath}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch captured image");

      const blob = await response.blob();
      const file = new File([blob], "camera-capture.jpg", { type: blob.type });
      
      setFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
      resetState();
    } catch (err) {
      setError("Failed to process camera image");
      console.error(err);
    } finally {
      setShowCamera(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    resetState();

    try {
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

      const { predicted_label } = response.data;
      setPredictedLabel(predicted_label);
      setGuideline(LABEL_GUIDELINES[predicted_label] || "No specific guidelines available.");
    } catch (err: any) {
      let errorMessage = "Error analyzing image";
      
      if (err.response) {
        // Handle FastAPI validation errors
        if (err.response.status === 422) {
          errorMessage = "Invalid image format. Please try another image.";
        } else {
          errorMessage = err.response.data?.detail || `Server error: ${err.response.status}`;
        }
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("API Error:", err);
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

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-green-700">
        ♻️ Waste Classifier
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
              onLoad={() => URL.revokeObjectURL(previewUrl)}
            />
            <div className="p-3 bg-gray-50 flex justify-between items-center">
              <span className="text-sm text-gray-600 truncate">
                {file?.name}
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
        onClick={handleAnalyze}
        disabled={loading || !file}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
          loading || !file 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </span>
        ) : "Analyze"}
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
            <p className="text-sm text-gray-700">{guideline}</p>
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