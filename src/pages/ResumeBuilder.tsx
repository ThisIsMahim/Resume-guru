import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Send, Bot, User, Download, RefreshCw, FileText, 
  AlertTriangle, HelpCircle, GraduationCap, Briefcase, Award, 
  Layout
} from "lucide-react";
import { toast } from "sonner";
import ResumeBuilderNavbar from "@/components/ResumeBuilderNavbar";
import { sendToWebhook } from "@/services/webhookService";
import DOMPurify from 'dompurify';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from "react-router-dom";
import { format } from 'date-fns';

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

interface HelperOption {
  id: string;
  text: string;
  prompt: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface CollectedInfo {
  personalInfo: { collected: boolean; data: any | null };
  education: { collected: boolean; data: any | null };
  experience: { collected: boolean; data: any | null };
  skills: { collected: boolean; data: any | null };
}

const SESSION_STORAGE_KEY = 'resumeGuru_lastSessionId';

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
  const [demoCvShown, setDemoCvShown] = useState(false);
  const [showShine, setShowShine] = useState(false);
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
  const [currentHelperOptions, setCurrentHelperOptions] = useState<HelperOption[]>([]);

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

    // Try to restore last session ID from storage
    const lastSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (lastSessionId) {
      // Verify if session is still valid
      verifyAndRestoreSession(lastSessionId);
    } else {
      // If no stored session, load or create new one
      loadExistingSession();
    }
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

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (sessionId) {
        try {
          await supabase
            .from('chat_sessions')
            .update({ 
              status: 'inactive',
              updated_at: new Date().toISOString()
            })
            .eq('session_id', sessionId);
        } catch (error) {
          console.error('Error updating session status:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also mark session as inactive when component unmounts
      handleBeforeUnload();
    };
  }, [sessionId]);

  const manageSession = async () => {
    if (!user) return;

    try {
      // Try to get or create an active session
      const { data: sessionData, error } = await supabase
        .rpc('manage_user_sessions', {
          p_user_id: user.id
        });

      if (error) throw error;

      if (sessionData) {
        setSessionId(sessionData);
        return sessionData;
      }
    } catch (error) {
      console.error('Error managing session:', error);
      toast.error('Failed to manage session');
    }
  };

  const verifyAndRestoreSession = async (sessionId: string) => {
    try {
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error || !session) {
        // If session not found or error, clear storage and load new session
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        await loadExistingSession();
        return;
      }

      // Restore session state
      setSessionId(session.session_id);
      if (session.memory_data) {
        setCollectedInfo(session.memory_data);
      }
      if (session.memory_data?.resumeHtml) {
        setResumeHtml(DOMPurify.sanitize(session.memory_data.resumeHtml));
      }

      // Load messages
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.session_id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      if (messages && messages.length > 0) {
        setMessages(messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.created_at)
        })));
        setShowQuickOptions(false);
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      await loadExistingSession();
    }
  };

  const loadExistingSession = async () => {
    if (!user) return;

    try {
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (sessions && sessions.length > 0) {
        const session = sessions[0];
        setSessionId(session.session_id);
        // Store session ID in storage
        sessionStorage.setItem(SESSION_STORAGE_KEY, session.session_id);
        
        // Get session data
        const { data: sessionData, error: sessionError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('session_id', session.session_id)
          .maybeSingle();

        if (sessionError) throw sessionError;

        if (sessionData) {
          // Set session data
          if (sessionData.memory_data) {
            setCollectedInfo(sessionData.memory_data);
          }
          if (sessionData.resume_html) {
            setResumeHtml(DOMPurify.sanitize(sessionData.resume_html));
          }

          // Load messages for this session
          const { data: messages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionData.session_id)
            .order('created_at', { ascending: true });

          if (messagesError) throw messagesError;

          if (messages && messages.length > 0) {
            setMessages(messages.map(msg => ({
              id: msg.id,
              content: msg.content,
              sender: msg.sender,
              timestamp: new Date(msg.created_at)
            })));
            setShowQuickOptions(false);
          } else {
            // Add welcome message for new sessions
            const welcomeMessage = {
              id: "welcome",
              content: "👋 Hi! I'm Mark, your ResumeGuru AI assistant. Through my 'Resume Enlightenment' approach, I've helped many people transform their careers.Just say a quick hello or choose one of the quick options below, and together we'll craft your career masterpiece! 🌟",
              sender: "ai" as const,
              timestamp: new Date()
            };
            setMessages([welcomeMessage]);
            await saveMessage(welcomeMessage.content, welcomeMessage.sender);
          }
        }
      } else {
        await createNewSession();
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast.error('Failed to load session');
    }
  };

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const storedSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (storedSessionId && storedSessionId !== sessionId) {
          await verifyAndRestoreSession(storedSessionId);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId, user]);

  const createNewSession = async () => {
    if (!user) return;
    
    try {
      const sessionId = crypto.randomUUID();
      const { error } = await supabase
        .from('chat_sessions')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          status: 'active',
          memory_data: null
        });

      if (error) throw error;
      
      setSessionId(sessionId);
      // Store session ID in storage
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);

      // Add welcome message
      const welcomeMessage = {
        id: "welcome",
        content: "👋 Hi! I'm Mark, your ResumeGuru AI assistant. Through my 'Resume Enlightenment' approach, I've helped thousands transform their careers. Say hello or choose one of the quick options below, and together we'll craft your career masterpiece! 🌟",
        sender: "ai" as const,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      await saveMessage(welcomeMessage.content, welcomeMessage.sender);

      return sessionId;
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast.error('Failed to initialize chat session');
    }
  };

  const saveMessage = async (content: string, sender: 'ai' | 'user') => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          content: content,
          sender: sender,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Failed to save message');
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

    // Set demoCvShown if the demo CV prompt is sent
    if (inputMessage === "Can you show me a demo resume for a software engineer? This will help me understand how to use the builder.") {
      setDemoCvShown(true);
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: "user",
      timestamp: new Date()
    };
    
    try {
      // Save user message
      await saveMessage(userMessage.content, userMessage.sender);
      setMessages(prev => [...prev, userMessage]);
      setCurrentInput("");
      setIsThinking(true);

      const response = await sendToWebhook(inputMessage, sessionId);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response.message,
        sender: "ai",
        timestamp: new Date()
      };

      // Save AI message
      await saveMessage(aiMessage.content, aiMessage.sender);
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
        const sanitizedHtml = DOMPurify.sanitize(response.resumeHtml);
        setResumeHtml(sanitizedHtml);
        setShowShine(true);
        // Reset shine after animation
        setTimeout(() => setShowShine(false), 1000);
        
        try {
          const { error } = await supabase
            .from('chat_sessions')
            .update({
              memory_data: {
                ...response.collectedInfo,
                resumeHtml: sanitizedHtml
              },
              resume_html: sanitizedHtml,
              updated_at: new Date().toISOString()
            })
            .eq('session_id', sessionId);

          if (error) throw error;
        } catch (error) {
          console.error('Error updating chat session:', error);
        }
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
    navigate('/upgrade');
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

      // For free tier users, show confirmation prompt
      if (isFreeTier && remainingDownloads > 0) {
        const confirmed = await new Promise((resolve) => {
          const toastId = toast.info(
            <div className="space-y-3">
              <p className="font-medium text-red-500">You have {remainingDownloads} download{remainingDownloads !== 1 ? 's' : ''} remaining</p>
              <p className="text-sm text-gray-500">Would you like the AI to refine your resume first? This won't use a download token.</p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    toast.dismiss(toastId);
                    resolve(false);
                  }}
                >
                  Refine First
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                  onClick={() => {
                    toast.dismiss(toastId);
                    resolve(true);
                  }}
                >
                  Download Now
                </Button>
              </div>
            </div>,
            {
              duration: 10000,
              onDismiss: () => resolve(false)
            }
          );
        });

        if (!confirmed) {
          setIsThinking(false);
          return;
        }
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
        await supabase
          .from('downloads')
          .insert({
            user_id: user.id,
            resume_name: 'Resume ' + format(new Date(), 'PPP'),
            format: 'HTML/PDF',
            resume_html: resumeHtml,
            created_at: new Date().toISOString()
          });
        
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
    // Mark current session as completed
    if (sessionId) {
      try {
        await supabase
          .from('chat_sessions')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('session_id', sessionId);
      } catch (error) {
        console.error('Error completing current session:', error);
      }
    }

    // Create new session
    await createNewSession();
    setResumeHtml("");
  };

  const getProgressPercentage = () => {
    const sections = Object.values(collectedInfo);
    const completedSections = sections.filter(section => section.collected).length;
    return (completedSections / sections.length) * 100;
  };

  const endSession = async () => {
    if (!sessionId) return;
    
    try {
      await supabase
        .from('chat_sessions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const updateHelperOptions = () => {
    const baseOptions: HelperOption[] = [
      {
        id: 'what-now',
        text: 'What should I tell you now?',
        prompt: "I'm not sure what information you need next. Can you guide me?",
        icon: HelpCircle
      },
      {
        id: 'generate-resume',
        text: 'Generate my resume',
        prompt: "Can you generate my resume with the information I've provided so far?",
        icon: FileText
      }
    ];

    // Only add demo CV option if it hasn't been shown
    if (!demoCvShown) {
      baseOptions.push({
        id: 'demo-cv',
        text: 'Show me a demo resume',
        prompt: "Can you show me a demo resume for a software engineer? This will help me understand how to use the builder.",
        icon: Layout
      });
    }

    // Dynamic options based on collected info
    const dynamicOptions: HelperOption[] = [];

    if (!collectedInfo.personalInfo.collected) {
      dynamicOptions.push({
        id: 'personal-info',
        text: 'Add personal details',
        prompt: "I'd like to add my personal information (name, contact, etc.)",
        icon: User
      });
    }

    if (!collectedInfo.education.collected) {
      dynamicOptions.push({
        id: 'education',
        text: 'Add education',
        prompt: "I want to add my educational background",
        icon: GraduationCap
      });
    }

    if (!collectedInfo.experience.collected) {
      dynamicOptions.push({
        id: 'experience',
        text: 'Add work experience',
        prompt: "I'd like to add my work experience",
        icon: Briefcase
      });
    }

    if (!collectedInfo.skills.collected) {
      dynamicOptions.push({
        id: 'skills',
        text: 'Add skills',
        prompt: "I want to add my skills and expertise",
        icon: Award
      });
    }

    // Combine and shuffle dynamic options to keep it fresh
    const shuffledDynamic = dynamicOptions.sort(() => Math.random() - 0.5);
    
    // Always keep base options and add 1-2 dynamic options
    setCurrentHelperOptions([
      ...baseOptions,
      ...shuffledDynamic.slice(0, 2)
    ]);
  };

  useEffect(() => {
    updateHelperOptions();
  }, [messages, collectedInfo, demoCvShown]);

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
                {/* Helper Options */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {currentHelperOptions.map((option) => (
                    <Button
                      key={option.id}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs bg-white/50 hover:bg-pink-50 text-gray-600 hover:text-pink-600 border border-gray-200"
                      onClick={() => handleSendMessage(option.prompt)}
                    >
                      {option.icon && <option.icon className="h-3 w-3 mr-1" />}
                      {option.text}
                    </Button>
                  ))}
                </div>
                
                {/* Existing text area and send button */}
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
            <Card className={`h-[calc(100vh-160px)] flex flex-col overflow-hidden shadow-xl rounded-xl border-0 relative ${showShine ? 'animate-shine' : ''}`}>
              <style>
                {`
                  @keyframes shine {
                    0% {
                      transform: translateX(-100%);
                    }
                    100% {
                      transform: translateX(100%);
                    }
                  }
                  .animate-shine::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                      90deg,
                      transparent 0%,
                      rgba(255, 255, 255, 0.6) 50%,
                      transparent 100%
                    );
                    animation: shine 1s ease-in-out;
                    pointer-events: none;
                    z-index: 50;
                  }
                  .animate-shine > * {
                    position: relative;
                    z-index: 1;
                  }
                `}
              </style>
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
