export interface WasteInfo {
    material: string;
    category: string;
    confidence: number; // Will be a dummy for now unless backend sends it
    instructions: string;
    binColor: string;
    recyclable: boolean;
  }
  
  export const labelMap: Record<number, WasteInfo> = {
    0: {
      material: "Cardboard",
      category: "Paper-based",
      confidence: 100,
      instructions: "Flatten boxes. Keep dry. Place in blue recycling bin.",
      binColor: "Blue",
      recyclable: true,
    },
    1: {
      material: "Glass",
      category: "Glass",
      confidence: 100,
      instructions: "Remove lids. Rinse thoroughly. Place in blue bin.",
      binColor: "Blue",
      recyclable: true,
    },
    2: {
      material: "Metal",
      category: "Aluminum/Steel",
      confidence: 100,
      instructions: "Rinse containers. Place in blue bin.",
      binColor: "Blue",
      recyclable: true,
    },
    3: {
      material: "Paper",
      category: "Mixed Paper",
      confidence: 100,
      instructions: "Keep dry. Avoid shredded paper. Place in blue bin.",
      binColor: "Blue",
      recyclable: true,
    },
    4: {
      material: "Plastic",
      category: "Mixed Plastics",
      confidence: 100,
      instructions: "Rinse containers. No plastic bags. Place in blue bin.",
      binColor: "Blue",
      recyclable: true,
    },
    5: {
      material: "Plastic Bag",
      category: "Soft Plastics",
      confidence: 100,
      instructions: "Do not place in curbside bin. Return to store collection point.",
      binColor: "Special Drop-off",
      recyclable: false,
    },
    6: {
      material: "Battery",
      category: "Hazardous Waste",
      confidence: 100,
      instructions: "Do not place in bin. Take to battery recycling center.",
      binColor: "Hazardous Waste Facility",
      recyclable: false,
    },
    7: {
      material: "Clothing",
      category: "Textiles",
      confidence: 100,
      instructions: "Donate if wearable. Otherwise, check textile recycling.",
      binColor: "Donation/Drop-off",
      recyclable: true,
    },
    8: {
      material: "Food Waste",
      category: "Organic",
      confidence: 100,
      instructions: "Place in green compost bin if available.",
      binColor: "Green",
      recyclable: false,
    },
    9: {
      material: "Electronics",
      category: "E-waste",
      confidence: 100,
      instructions: "Take to e-waste recycling center.",
      binColor: "E-waste Collection",
      recyclable: false,
    },
    10: {
      material: "Shoes",
      category: "Textiles",
      confidence: 100,
      instructions: "Donate if usable. Otherwise, drop at shoe recycling bins.",
      binColor: "Donation/Drop-off",
      recyclable: true,
    },
    11: {
      material: "Trash",
      category: "General Waste",
      confidence: 100,
      instructions: "Dispose in black trash bin. Avoid mixing with recyclables.",
      binColor: "Black",
      recyclable: false,
    }
  };
  