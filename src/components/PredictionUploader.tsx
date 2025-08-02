import React, { useState } from "react";
import axios from "axios";
import { labelMap, WasteInfo } from "@/lib/labelMap";

const LABEL_GUIDELINES: Record<string, string> = {
  "white-glass": "Recycle in white-glass bin. Ensure it's clean.",
  "trash": "Dispose in general waste. Not recyclable.",
  "shoes": "Donate if usable. Otherwise dispose in trash.",
  "plastic": "Recycle in plastics bin. Rinse before disposing.",
  "paper": "Recycle in paper bin. Avoid soiled paper.",
  "metal": "Recycle in metal bin. Rinse containers.",
  "green-glass": "Recycle in green-glass bin. Clean it first.",
  "clothes": "Donate if wearable. Otherwise dispose responsibly.",
  "cardboard": "Flatten and recycle in cardboard bin.",
  "brown-glass": "Recycle in brown-glass bin. Keep it clean.",
  "biological": "Dispose in organic/biodegradable waste.",
  "battery": "Take to e-waste/battery recycling station.",
};

const PredictionUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [predictedLabel, setPredictedLabel] = useState("");
  const [guideline, setGuideline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setPredictedLabel("");
    setGuideline("");
    setError("");
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    setPredictedLabel("");
    setGuideline("");

    try {
      const response = await fetch("http://127.0.0.1:8000", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Prediction failed.");
      }

      const data = await response.json();
      const label = data.predicted_label;
      setPredictedLabel(label);
      setGuideline(LABEL_GUIDELINES[label] || "No guideline found.");
    } catch (err: any) {
      setError(err.message || "Error predicting label.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4 text-center">♻️ Waste Classifier</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4 w-full"
      />
      <button
        onClick={handleAnalyze}
        disabled={loading || !file}
        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && (
        <p className="mt-4 text-red-600 font-medium text-center">{error}</p>
      )}

      {predictedLabel && (
        <div className="mt-6 p-4 bg-green-100 rounded border border-green-400">
          <p className="text-lg font-semibold">Predicted Type: {predictedLabel}</p>
          <p className="mt-2 text-sm text-gray-800">{guideline}</p>
        </div>
      )}
    </div>
  );
};

export default PredictionUploader;
