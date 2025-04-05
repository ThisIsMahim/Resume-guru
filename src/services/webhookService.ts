import { supabase } from "@/integrations/supabase/client";

interface WebhookResponse {
  message: string;
  resumeHtml?: string | null;
  collectedInfo?: {
    personalInfo: { collected: boolean; data: any | null };
    education: { collected: boolean; data: any | null };
    experience: { collected: boolean; data: any | null };
    skills: { collected: boolean; data: any | null };
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
    
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    const makeRequest = async (retryCount = 0): Promise<WebhookResponse> => {
      try {
        const response = await fetch("https://mayhem123.app.n8n.cloud/webhook/resumeGuruAI", {
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

        // Read response as text first
        const responseText = await response.text();
        console.log("Raw webhook response:", responseText);

        if (!response.ok) {
          // Check if it's an n8n specific error
          try {
            const errorJson = JSON.parse(responseText);
            if (errorJson.n8nDetails) {
              console.error("n8n specific error:", errorJson.n8nDetails);
              
              // If it's an OpenAI provider error and we haven't exceeded retries
              if (errorJson.errorMessage === "Provider returned error" && retryCount < MAX_RETRIES) {
                console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return makeRequest(retryCount + 1);
              }
              
              return {
                message: "The AI service is currently experiencing issues. Please try again in a few moments.",
                error: `n8n error: ${errorJson.errorMessage}`
              };
            }
          } catch (parseError) {
            // If error text isn't JSON, continue with normal error handling
          }
          
          throw new Error(`Webhook responded with status: ${response.status}`);
        }

        // Check for empty response
        if (!responseText.trim()) {
          console.error("Empty response received from webhook");
          return {
            message: "The service returned an empty response. Please try again.",
            error: "Empty response"
          };
        }

        // Parse the response
        try {
          const data = JSON.parse(responseText);
          console.log("Webhook response:", data);
          
          // Handle array response from n8n
          const responseData = Array.isArray(data) ? data[0] : data;
          
          // Validate response data structure
          if (!responseData || typeof responseData !== 'object') {
            throw new Error('Invalid response format');
          }
          
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
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          return {
            message: "The service returned an invalid response. Please try again later.",
            error: "JSON parsing error"
          };
        }
      } catch (error) {
        throw error; // Propagate the error to the outer catch block
      }
    };

    return await makeRequest();
  } catch (error) {
    console.error("Error in webhook service:", error);
    return {
      message: "Failed to process your request. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
