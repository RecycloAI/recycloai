import React, { useState } from "react";
import axios from "axios";
import { labelMap, WasteInfo } from "@/lib/labelMap";

const WasteScanner: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [result, setResult] = useState<WasteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setResult(null); // Clear previous result
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await axios.post("http://localhost:8000/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const classIndex: number = response.data.predicted_class;
      const info = labelMap[classIndex];

      if (info) {
        setResult(info);
      } else {
        setError("Unknown class prediction.");
      }
    } catch (err) {
      console.error(err);
      setError("Error predicting label.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center text-green-700">♻️ Waste Scanner</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
      />

      <button
        onClick={handleAnalyze}
        disabled={!selectedImage || loading}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {result && (
        <div className="mt-6 p-4 border border-green-200 rounded-md bg-green-50">
          <h2 className="text-lg font-semibold text-green-800">🧾 Prediction Result</h2>
          <p><strong>Material:</strong> {result.material}</p>
          <p><strong>Category:</strong> {result.category}</p>
          <p><strong>Recyclable:</strong> {result.recyclable ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Recommended Bin:</strong> {result.binColor}</p>
          <p className="mt-2"><strong>Instructions:</strong><br />{result.instructions}</p>
        </div>
      )}
    </div>
  );
};

export default WasteScanner;
