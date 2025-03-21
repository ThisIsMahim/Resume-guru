import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, Download, RefreshCw, PaperclipIcon, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ResumeBuilderNavbar from "@/components/ResumeBuilderNavbar";
import { sendToWebhook } from "@/services/webhookService";
import DOMPurify from 'dompurify';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  sender: "ai" | "user";
  timestamp: Date;
}

interface QuickOption {
  id: string;
  text: string;
  prompt: string;
}

interface CollectedInfo {
  personalInfo: { collected: boolean; data: any | null };
  education: { collected: boolean; data: any | null };
  experience: { collected: boolean; data: any | null };
  skills: { collected: boolean; data: any | null };
}

function DownloadCounter({ remainingDownloads, isFreeTier }: { remainingDownloads: number; isFreeTier: boolean }) {
  if (!isFreeTier) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full">
      <AlertTriangle className="h-4 w-4 text-white/70" />
      {remainingDownloads === -1 ? (
        <span className="text-white font-medium">
          Unlimited downloads
        </span>
      ) : (
        <span className={`font-medium ${
          remainingDownloads === 0 
            ? 'text-red-200' 
            : remainingDownloads <= 1 
              ? 'text-amber-200' 
              : 'text-white'
        }`}>
          {remainingDownloads} download{remainingDownloads !== 1 ? 's' : ''} remaining
        </span>
      )}
    </div>
  );
}

const ResumeBuilder = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [resumeHtml, setResumeHtml] = useState<string>("");
  const [showQuickOptions, setShowQuickOptions] = useState(true);
  const [collectedInfo, setCollectedInfo] = useState<CollectedInfo>({
    personalInfo: { collected: false, data: null },
    education: { collected: false, data: null },
    experience: { collected: false, data: null },
    skills: { collected: false, data: null }
  });
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string>("");
  const { user, session } = useAuth();
  const { 
    isFreeTier, 
    checkDownloadLimit, 
    recordDownload 
  } = useSubscription();
  const [remainingDownloads, setRemainingDownloads] = useState<number>(3);

  const quickOptions: QuickOption[] = [
    {
      id: "fresh-grad",
      text: "I'm a fresh graduate looking for my first job",
      prompt: "I'm a fresh graduate looking to create my first professional resume."
    },
    {
      id: "career-change",
      text: "I want to change my career path",
      prompt: "I'm looking to transition to a new career and need help highlighting my transferable skills."
    },
    {
      id: "experience",
      text: "I have work experience and want to upgrade my resume",
      prompt: "I have professional experience and want to create a more impactful resume."
    },
    {
      id: "tech",
      text: "I'm applying for tech positions",
      prompt: "I want to create a resume focused on technical roles in the software industry."
    }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    createNewSession();
    // Add initial welcome message
    setMessages([
      {
        id: "welcome",
        content: "Hi! I'm your ResumeGuru AI assistant. I'll help you create a professional resume. Tell me about yourself and what kind of resume you'd like to create.",
        sender: "ai",
        timestamp: new Date()
      }
    ]);
  }, [user, navigate]);

  useEffect(() => {
    async function fetchRemainingDownloads() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .rpc('get_remaining_downloads', {
            user_id: user.id
          }) as { data: number | null; error: any };

        if (error) throw error;
        setRemainingDownloads(data ?? 3);
      } catch (error) {
        console.error('Error fetching remaining downloads:', error);
      }
    }

    fetchRemainingDownloads();
  }, [user]);

  const createNewSession = async () => {
    if (user) {
      const newSessionId = `session_${user.id}_${Date.now()}`;
      setSessionId(newSessionId);
      
      // Store session in Supabase
      try {
        const { error } = await supabase
          .from('chat_sessions')
          .insert({
            session_id: newSessionId,
            user_id: user.id,
            status: 'active',
            memory_data: null
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error creating chat session:', error);
        toast.error('Failed to initialize chat session');
      }
    }
  };

  const handleQuickOption = (option: QuickOption) => {
    setShowQuickOptions(false);
    setCurrentInput(option.prompt);
    handleSendMessage(option.prompt);
  };

  const handleSendMessage = async (message?: string) => {
    if (!user || !session) {
      toast.error('Please sign in to continue');
      navigate('/auth');
      return;
    }

    const inputMessage = message || currentInput;
    if (inputMessage.trim() === "") return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsThinking(true);

    try {
      const response = await sendToWebhook(inputMessage, sessionId);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response.message,
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (response.collectedInfo) {
        setCollectedInfo(response.collectedInfo);
        
        // Update session data in Supabase
        try {
          const { error } = await supabase
            .from('chat_sessions')
            .update({
              memory_data: response.collectedInfo,
              updated_at: new Date().toISOString()
            })
            .eq('session_id', sessionId);

          if (error) throw error;
        } catch (error) {
          console.error('Error updating chat session:', error);
        }
      }
      
      if (response.resumeHtml) {
        setResumeHtml(DOMPurify.sanitize(response.resumeHtml));
      }
      
      if (response.error) {
        toast.error("Error", {
          description: response.error
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
      toast.error("Error", {
        description: "Failed to process your message. Please try again."
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleUpgradeClick = () => {
    navigate('/');
    setTimeout(() => {
      const pricingSection = document.getElementById('pricing');
      pricingSection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };


  const handleDownload = async () => {
    if (!resumeHtml) {
      toast.error("No resume to download", {
        description: "Please complete the conversation to generate your resume first."
      });
      return;
    }

    if (!user) {
      toast.error("Please sign in", {
        description: "You need to be signed in to download your resume."
      });
      return;
    }

    try {
      setIsThinking(true);
      
      // Check download limits for free tier
      const canDownload = await checkDownloadLimit();
      if (!canDownload) {
        toast.error("Download limit reached", {
          description: (
            <div className="space-y-2">
              <p>You've used all your downloads for this month.</p>
              <Button asChild variant="outline" size="sm" onClick={handleUpgradeClick}>
                <span>Upgrade to Premium</span>
              </Button>
            </div>
          )
        });
        return;
      }
      

      const apiPort = 3001;
      const apiUrl = `http://localhost:${apiPort}`;
      
      // First check if the server is available
      try {
        const healthCheck = await fetch(`${apiUrl}/api/health`, {
          mode: 'cors',
          credentials: 'include'
        });
        
        if (!healthCheck.ok) {
          throw new Error(`Resume preview service is not available (Status: ${healthCheck.status})`);
        }
      } catch (error) {
        console.error('Health check failed:', error);
        throw new Error('Could not connect to resume preview service. Please ensure the server is running.');
      }

      // Add watermark for free tier
      let htmlToSend = resumeHtml;
      if (isFreeTier) {
        const watermark = `
          <div style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.1);
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            color: #666;
            z-index: 1000;
          ">
            Created with Resume.Guru - Upgrade to remove watermark
          </div>
        `;
        htmlToSend = resumeHtml.replace('</body>', `${watermark}</body>`);
      }
      
      // Get the HTML preview
      const response = await fetch(`${apiUrl}/api/preview-resume`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/html',
          'Origin': window.location.origin
        },
        body: JSON.stringify({ html: htmlToSend }),
      });

      if (!response.ok) {
        throw new Error(`Failed to preview resume (Status: ${response.status})`);
      }

      // Check content type to ensure we're getting HTML
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('text/html')) {
        throw new Error('Invalid response format. Expected HTML content.');
      }

      // Get the HTML content
      const htmlContent = await response.text();
      
      // Validate that we received HTML content
      if (!htmlContent.trim().toLowerCase().startsWith('<!doctype html')) {
        throw new Error('Invalid HTML content received from server');
      }
      
      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Record the download
        await recordDownload('resume-' + new Date().toISOString());
        
        toast.success("Resume opened in new tab!", {
          description: "Use Ctrl/Cmd + P to save as PDF or print."
        });
      } else {
        throw new Error('Pop-up blocked. Please allow pop-ups for this site to download your resume.');
      }

      // After successful download, refresh remaining downloads
      const { data: remainingData } = await supabase
        .rpc('get_remaining_downloads', {
          user_id: user.id
        }) as { data: number | null; error: any };
      
      setRemainingDownloads(remainingData ?? 0);

    } catch (error) {
      console.error('Error previewing resume:', error);
      toast.error("Failed to preview resume", {
        description: error instanceof Error ? error.message : "There was an error generating your preview. Please try again."
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleReset = async () => {
    await createNewSession();
    setMessages([
      {
        id: "welcome-reset",
        content: "Let's start fresh! Tell me about yourself and what kind of resume you'd like to create.",
        sender: "ai",
        timestamp: new Date()
      }
    ]);
    setResumeHtml("");
  };

  const getProgressPercentage = () => {
    const sections = Object.values(collectedInfo);
    const completedSections = sections.filter(section => section.collected).length;
    return (completedSections / sections.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50">
      <ResumeBuilderNavbar />
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-160px)] flex flex-col overflow-hidden shadow-xl rounded-xl border-0">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 flex items-center">
                <Bot className="mr-2 h-6 w-6 text-pink-200" />
                <h2 className="font-semibold">ResumeGuru AI Assistant</h2>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-white">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className={`items-center justify-center ${msg.sender === 'user' ? 'ml-2' : 'mr-2'} ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-br from-purple-400 to-purple-600 ring-2 ring-purple-200' 
                          : 'bg-gradient-to-br from-pink-400 to-pink-600 ring-2 ring-pink-200'
                      } h-8 w-8`}>
                        {msg.sender === 'user' ? 
                          <User className="h-4 w-4 text-white" /> : 
                          <Bot className="h-4 w-4 text-white" />
                        }
                      </Avatar>
                      <div className={`rounded-lg p-3 ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-tr-none shadow-md' 
                          : 'bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {showQuickOptions && messages.length === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4"
                  >
                    {quickOptions.map((option) => (
                      <Button
                        key={option.id}
                        variant="outline"
                        className="p-4 h-auto text-left flex flex-col items-start gap-2 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                        onClick={() => handleQuickOption(option)}
                      >
                        <span className="font-medium">{option.text}</span>
                      </Button>
                    ))}
                  </motion.div>
                )}
                
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="flex items-start max-w-[80%]">
                      <Avatar className="mr-2 bg-gradient-to-br from-pink-400 to-pink-600 ring-2 ring-pink-200 h-8 w-8">
                        <Bot className="h-4 w-4 text-white" />
                      </Avatar>
                      <div className="rounded-lg p-3 bg-white text-gray-800 rounded-tl-none border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-1">
                          <div className="h-2 w-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="h-2 w-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          <div className="h-2 w-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t p-4 bg-gray-50">
                <div className="flex items-center">
                  <textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Tell me about yourself..."
                    className="flex-grow border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none h-12 max-h-48"
                    rows={1}
                  />
                  <Button 
                    onClick={() => handleSendMessage()} 
                    className="rounded-l-none h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    disabled={isThinking || currentInput.trim() === ''}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-160px)] flex flex-col overflow-hidden shadow-xl rounded-xl border-0">
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-4 flex items-center justify-between">
                <h2 className="font-semibold">Your Resume</h2>
                <DownloadCounter remainingDownloads={remainingDownloads} isFreeTier={isFreeTier} /> 

                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-transparent hover:bg-white/10 text-white border-white/20"
                      onClick={handleReset}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-transparent hover:bg-white/10 text-white border-white/20"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6 bg-white">
                {resumeHtml ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: resumeHtml }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-xs mx-auto">
                      <div className="bg-pink-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-pink-500" />
                      </div>
                      <p className="text-gray-500">
                        Your professional resume will appear here as we chat.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
