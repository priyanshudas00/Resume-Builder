import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the AI model with error handling
const initializeAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

const model = initializeAI();

const safeGenerateContent = async (prompt: string) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
};

export async function generateSummary(experience: string, skills: string[]): Promise<string> {
  if (!experience && skills.length === 0) {
    throw new Error('Please add some experience or skills first');
  }

  const prompt = `Create a professional summary for a resume based on the following experience and skills:

Experience:
${experience || 'No experience provided'}

Skills:
${skills.length > 0 ? skills.join(', ') : 'No skills provided'}

Write a concise, powerful professional summary that highlights key achievements and skills. Keep it under 3 sentences. Focus on strengths and potential.`;

  return safeGenerateContent(prompt);
}

export async function improveDescription(description: string): Promise<string> {
  if (!description) {
    throw new Error('Please provide a description to improve');
  }

  const prompt = `Improve the following job description to be more impactful and professional:

${description}

Guidelines:
1. Use strong action verbs
2. Include specific, quantifiable achievements
3. Highlight key responsibilities
4. Keep it concise and professional
5. Focus on results and impact`;

  return safeGenerateContent(prompt);
}

export async function suggestSkills(experience: string): Promise<string[]> {
  if (!experience) {
    throw new Error('Please add some experience first');
  }

  const prompt = `Based on the following professional experience, suggest relevant technical and soft skills:

${experience}

Guidelines:
1. Include both technical and soft skills
2. Be specific and relevant to the industry
3. Focus on in-demand skills
4. Include both hard and soft skills
5. Return only a comma-separated list of skills, no other text`;

  const result = await safeGenerateContent(prompt);
  return result.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
}

export async function generateAchievements(description: string): Promise<string[]> {
  if (!description) {
    throw new Error('Please provide a job description first');
  }

  const prompt = `Based on the following job description, generate 3 specific, quantifiable achievements:

${description}

Guidelines:
1. Start each achievement with a strong action verb
2. Include specific numbers and metrics where possible
3. Focus on results and impact
4. Make them measurable and concrete
5. Format as bullet points`;

  const result = await safeGenerateContent(prompt);
  return result
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && line.match(/^[•\-\*]?\s*(.+)$/))
    .map(line => line.replace(/^[•\-\*]\s*/, ''));
}