import { GoogleGenAI, Type } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("VITE_GEMINI_API_KEY is missing from environment variables.");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeRetinalImage = async (
  base64Image: string,
  mimeType: string,
  customPrompt?: string
): Promise<{ grade: string; reasoning: string; notes: string; regions: Array<{label: string, ymin: number, xmin: number, ymax: number, xmax: number}> }> => {
  try {
    const ai = getGeminiClient();
    
    // Using gemini-3-flash-preview for multimodal capabilities
    const modelId = "gemini-3-flash-preview"; 

    const prompt = customPrompt || `
      You are an expert ophthalmologist AI assistant named NexEye. 
      Analyze the provided retinal image. 
      Identify potential issues, focusing on Diabetic Retinopathy (DR) signs like microaneurysms, hemorrhages, hard exudates, or cotton wool spots.
      
      If the image is not a retinal image, state that it is invalid in the notes and give a grade of "Invalid".

      Provide a "Final Grade" (e.g., "No DR", "Mild DR", "Moderate DR", "Severe DR", "Proliferative DR").
      
      Provide "AI Reasoning" - CRITICAL: You MUST format the reasoning field EXACTLY as shown below. Do not use any other format.
      
      Format your response exactly as:
      DESCRIPTION: [Write a professional 3-4 line explanation of this condition in simple terms that the patient can understand]
      CAUSE: [Write 2-3 lines about potential causes that may have led to this stage of diabetic retinopathy]
      REMEDY: [Write one line with the recommended next step or remedy]
      
      Example format:
      DESCRIPTION: This retinal scan shows signs of moderate diabetic retinopathy, a complication of diabetes affecting the blood vessels in the eye. The condition indicates damage to small blood vessels that can leak fluid or bleed, potentially affecting vision. Early detection and management are crucial to prevent progression to more severe stages.
      CAUSE: This condition typically develops from prolonged high blood sugar levels damaging the retinal blood vessels. Poor glycemic control, hypertension, and duration of diabetes are major contributing factors.
      REMEDY: Immediate referral to a retinal specialist for detailed evaluation and possible laser photocoagulation treatment is recommended.

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

export const compareScans = async (prompt: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const modelId = "gemini-3-flash-preview";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: prompt }],
      },
    });

    return response.text || "Unable to generate comparison";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Gemini Comparison Error:", errorMessage);
    throw new Error(`Comparison failed: ${errorMessage}`);
  }
};