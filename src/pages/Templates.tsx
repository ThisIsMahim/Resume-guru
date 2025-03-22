import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ResumeBuilderNavbar from "@/components/ResumeBuilderNavbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Crown, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'sonner';

interface Download {
  id: string;
  created_at: string;
  resume_name: string;
  format: string;
  user_id: string;
  resume_html: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const Templates = () => {
  const [recentDownloads, setRecentDownloads] = useState<Download[]>([]);
  const { user } = useAuth();
  const { isPremiumTier } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentDownloads();
  }, []);

  const fetchRecentDownloads = async () => {
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setRecentDownloads(data || []);
    } catch (error) {
      console.error('Error fetching recent downloads:', error);
      toast.error('Failed to fetch recent downloads');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async (download: Download) => {
    try {
      if (!download.resume_html) {
        toast.error("Preview not available");
        return;
      }

      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(download.resume_html);
        printWindow.document.close();
        
        toast.success("Resume opened in new tab!", {
          description: "Use Ctrl/Cmd + P to save as PDF or print."
        });
      } else {
        throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
      }
    } catch (error) {
      console.error('Error previewing resume:', error);
      toast.error("Failed to preview resume", {
        description: error instanceof Error ? error.message : "There was an error generating your preview."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50">
      <ResumeBuilderNavbar />
      
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Professional Resume Templates
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our collection of professionally designed templates. Each template is ATS-optimized and crafted to help you stand out.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="free" className="space-y-8">
            <div className="flex justify-between items-center">
            <div className="flex items-center justify-center space-x-6 w-full bg-transparent">
            <TabsList className="bg-white/50">
                <TabsTrigger value="free" className="text-xl">Free Templates</TabsTrigger>
                <TabsTrigger value="premium" className="text-xl">Premium Templates</TabsTrigger>
              </TabsList>
              </div>
            </div>

            <TabsContent value="free" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="relative group"
                >
                  <Card className="relative group overflow-hidden border-2 border-dashed border-gray-200 rounded-xl p-4 min-h-[400px] flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <div className="text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Free templates coming soon!</p>
                      <p className="text-sm mt-2">Stay tuned for our basic template collection</p>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link to="/resume-builder">Try AI Builder Now</Link>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="premium" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="relative group"
                >
                  <Card className="relative group overflow-hidden border-2 border-dashed border-purple-200 rounded-xl p-4 min-h-[400px] flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-sm">
                    <div className="text-center text-gray-500">
                      <Crown className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                      <p className="font-medium">Premium templates coming soon!</p>
                      <p className="text-sm mt-2">Exclusive designs for our premium users</p>
                      {!isPremiumTier && (
                        <Button className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600" asChild>
                          <Link to="/upgrade">Upgrade to Premium</Link>
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Recent Downloads Section */}
      <section className="py-12 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Recently Created Resumes
            </h2>
            {!isPremiumTier && (
              <Button variant="outline" className="bg-white/50" asChild>
                <Link to="/upgrade">
                  <Crown className="w-4 h-4 mr-2 text-purple-600" />
                  Premium Templates
                </Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Add loading skeletons for better UX
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : recentDownloads.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No resumes created yet
              </div>
            ) : (
              recentDownloads.map((download) => (
                <motion.div
                  key={download.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="h-full"
                >
                  <Card className="p-6 h-full bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
                    <div className="flex flex-col h-full justify-between space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white ring-2 ring-white/50 shadow-lg">
                            {download.profiles?.avatar_url ? (
                              <img 
                                src={download.profiles.avatar_url} 
                                alt="User avatar" 
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {download.profiles?.full_name || 'Anonymous User'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {format(new Date(download.created_at), 'MMMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 border border-purple-200">
                          {download.format}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100/50">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 hover:bg-purple-50 border-purple-200 hover:text-purple-700 transition-colors duration-200 w-full justify-center"
                          onClick={() => handlePreview(download)}
                        >
                          <FileText className="h-4 w-4" />
                          Preview Resume
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Templates; 