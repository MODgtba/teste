import { GoogleGenAI, Type } from "@google/genai";
import { Video, VideoDetail, Comment } from "../types";

// Helper to get consistent images based on text
const getThumbnail = (id: string) => `https://picsum.photos/seed/${id}/640/360`;
const getAvatar = (id: string) => `https://picsum.photos/seed/${id}-avatar/100/100`;

export const generateVideos = async (query: string = "trending"): Promise<Video[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a list of 12 realistic, engaging video titles, channel names, and durations for a video platform. 
      The videos should differ based on the query: "${query}". 
      If the query is generic, provide a mix of tech, gaming, vlog, and music.
      Make view counts realistic (e.g., "1.2M", "340K"). 
      Make timestamps relative (e.g., "2 days ago").
      Provide result in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique short ID" },
              title: { type: Type.STRING },
              channelName: { type: Type.STRING },
              views: { type: Type.STRING },
              uploadedAt: { type: Type.STRING },
              duration: { type: Type.STRING },
              category: { type: Type.STRING }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => ({
      ...item,
      thumbnailUrl: getThumbnail(item.id + item.title),
      channelAvatarUrl: getAvatar(item.channelName)
    }));
  } catch (error) {
    console.error("Failed to generate videos", error);
    // Fallback data
    return Array.from({ length: 8 }).map((_, i) => ({
      id: `fallback-${i}`,
      title: "Unable to load AI content. Check API Key.",
      channelName: "System",
      views: "0",
      uploadedAt: "Now",
      duration: "0:00",
      thumbnailUrl: "https://picsum.photos/640/360",
      channelAvatarUrl: "https://picsum.photos/100/100"
    }));
  }
};

export const generateVideoDetails = async (videoId: string, title: string): Promise<VideoDetail | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate detailed metadata for a video titled "${title}". 
      Include a long description (2 paragraphs), subscriber count, like count, and 5 realistic user comments.
      Output JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            subscribers: { type: Type.STRING },
            likes: { type: Type.STRING },
            comments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  author: { type: Type.STRING },
                  content: { type: Type.STRING },
                  likes: { type: Type.INTEGER },
                  timeAgo: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Construct full object merging passed details with generated details
    return {
      id: videoId,
      title: title,
      thumbnailUrl: getThumbnail(videoId + title),
      channelName: "Loading...", // Will be updated by UI context usually, but here we just mock
      channelAvatarUrl: getAvatar("unknown"),
      views: "1M",
      uploadedAt: "1 day ago",
      duration: "10:00",
      ...data,
      comments: data.comments.map((c: any, i: number) => ({
        id: `comment-${i}`,
        ...c,
        avatarUrl: getAvatar(c.author)
      }))
    };
  } catch (error) {
    console.error("Failed to generate details", error);
    return null;
  }
};

export const searchSuggestion = async (query: string): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate 5 short search suggestions based on "${query}" for a video site. JSON Array of strings only.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) {
        return [];
    }
}

export const generateRealVideo = async (prompt: string): Promise<string | null> => {
    // Create new instance to ensure we capture the latest API Key if it was just selected
    const aiWithAuth = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        let operation = await aiWithAuth.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: `Cinematic high quality video: ${prompt}`,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
          }
        });

        // Poll for completion
        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await aiWithAuth.operations.getVideosOperation({operation: operation});
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            return `${downloadLink}&key=${process.env.API_KEY}`;
        }
        return null;
    } catch (error: any) {
        // Suppress generic logging for expected authentication/billing errors to keep console clean for user
        const msg = error.message || JSON.stringify(error);
        if (msg.includes("404") || msg.includes("NOT_FOUND") || msg.includes("Requested entity was not found")) {
             throw new Error("VEO_MODEL_NOT_FOUND");
        }
        console.error("Veo generation error:", error);
        throw error;
    }
}
