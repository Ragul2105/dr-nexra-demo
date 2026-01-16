import { GoogleGenAI, Type } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is missing from environment variables.");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeRetinalImage = async (base64Image: string, mimeType: string): Promise<{ grade: string; reasoning: string; notes: string; regions: Array<{label: string, ymin: number, xmin: number, ymax: number, xmax: number}> }> => {
  try {
    const ai = getGeminiClient();
    
    // Using gemini-3-flash-preview for multimodal capabilities
    const modelId = "gemini-3-flash-preview"; 

    const prompt = `
      You are an expert ophthalmologist AI assistant named NexEye. 
      Analyze the provided retinal image. 
      Identify potential issues, focusing on Diabetic Retinopathy (DR) signs like microaneurysms, hemorrhages, hard exudates, or cotton wool spots.
      
      If the image is not a retinal image, state that it is invalid in the notes and give a grade of "Invalid".

      Provide a "Final Grade" (e.g., "No DR", "Mild DR", "Moderate DR", "Severe DR", "Proliferative DR").
      
      Provide "AI Reasoning": A comprehensive clinical assessment. Structure the response clearly with the following sections:
      
      **Key Findings:**
      - List specific anomalies detected (e.g., count and location of microaneurysms).
      - Note any hemorrhages, exudates, or cotton wool spots.
      
      **Severity Justification:**
      - Explain why the findings map to the chosen grade based on clinical scales (e.g., ICDR).
      
      **Anatomical Context:**
      - Comment on the status of the optic disc and macula.
      - Note image quality or confounding factors if relevant.

      Provide "Clinician Notes": Technical medical notes under 30 words.
      
      Crucially, identify 2-4 key regions of interest (ROI) where anomalies are detected.
      Return the bounding box coordinates for these regions on a scale of 0 to 100.
      For example, ymin=0 is top, ymax=100 is bottom.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType, 
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grade: { type: Type.STRING, description: "The severity grade of the diagnosis." },
            reasoning: { type: Type.STRING, description: "Comprehensive, structured AI reasoning report." },
            notes: { type: Type.STRING, description: "Technical clinician notes." },
            regions: {
              type: Type.ARRAY,
              description: "List of identified regions of interest.",
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "Type of anomaly (e.g., 'Microaneurysm')" },
                  ymin: { type: Type.NUMBER, description: "Top coordinate (0-100)" },
                  xmin: { type: Type.NUMBER, description: "Left coordinate (0-100)" },
                  ymax: { type: Type.NUMBER, description: "Bottom coordinate (0-100)" },
                  xmax: { type: Type.NUMBER, description: "Right coordinate (0-100)" },
                },
                required: ["label", "ymin", "xmin", "ymax", "xmax"],
              },
            },
          },
          required: ["grade", "reasoning", "notes", "regions"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(jsonText);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Gemini Analysis Error:", errorMessage);
    console.error("Full error:", error);
    return {
      grade: "Error",
      reasoning: `Analysis failed due to an error: ${errorMessage}`,
      notes: "Failed to analyze image.",
      regions: [],
    };
  }
};