// Service to interact with Hugging Face Space for DR detection
export interface HFDRResult {
  detailed_classification: Record<string, number>;
  highest_probability_class: string;
}

export async function analyzeWithHuggingFace(imageBase64: string, mimeType: string): Promise<HFDRResult> {
  // Convert base64 to Blob
  const byteString = atob(imageBase64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeType });

  const formData = new FormData();
  formData.append('file', blob, 'image.png');

  const response = await fetch('https://sairamdev-selfie-dr.hf.space/predict', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.status}`);
  }

  return await response.json();
}
