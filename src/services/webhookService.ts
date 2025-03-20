import { supabase } from "@/integrations/supabase/client";

interface CollectedInfo {
  personalInfo: { collected: boolean; data: any | null };
  education: { collected: boolean; data: any | null };
  experience: { collected: boolean; data: any | null };
  skills: { collected: boolean; data: any | null };
}

interface WebhookResponse {
  message: string;
  resumeHtml?: string | null;
  collectedInfo?: {
    personalInfo: { collected: boolean; data: any };
    education: { collected: boolean; data: any };
    experience: { collected: boolean; data: any };
    skills: { collected: boolean; data: any };
  };
  error?: string;
}

export const sendToWebhook = async (
  message: string,
  sessionId: string
): Promise<WebhookResponse> => {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No active session found");
    }

    console.log("Sending to webhook:", message);
    
    const response = await fetch("https://mayhem69.app.n8n.cloud/webhook/resumeGuruAI", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        message,
        sessionId,
        userId: session.user.id,
        userEmail: session.user.email,
        timestamp: new Date().toISOString(),
        source: 'resume-guru-frontend',
        type: 'resume-creation',
        disableToolUse: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Webhook error response:", errorText);
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    let data;
    try {
      data = await response.json();
      console.log("Webhook response:", data);
      
      // Handle array response from n8n
      const responseData = Array.isArray(data) ? data[0] : data;
      
      return {
        message: responseData.message || "I apologize, but I didn't receive a proper response.",
        resumeHtml: responseData.resumeHtml || null,
        collectedInfo: responseData.collectedInfo || {
          personalInfo: { collected: false, data: null },
          education: { collected: false, data: null },
          experience: { collected: false, data: null },
          skills: { collected: false, data: null }
        },
        error: responseData.error
      };
    } catch (error) {
      console.error("Failed to parse response as JSON:", error);
      return {
        message: "The service returned an invalid response. Please try again later.",
        error: "JSON parsing error"
      };
    }
  } catch (error) {
    console.error("Error in webhook service:", error);
    return {
      message: "Failed to process your request. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
