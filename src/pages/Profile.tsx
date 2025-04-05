import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Crown, Calendar, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import ResumeBuilderNavbar from '@/components/ResumeBuilderNavbar';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';

interface Download {
  id: string;
  created_at: string;
  resume_name: string;
  format: string;
  resume_html: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { subscription, isFreeTier, isPremiumTier } = useSubscription();
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [remainingDownloads, setRemainingDownloads] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    navigate('/upgrade');
  };

  useEffect(() => {
    async function fetchDownloads() {
      if (!user) return;

      try {
        // Fetch downloads
        const { data: downloadsData, error: downloadsError } = await supabase
          .from('downloads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (downloadsError) throw downloadsError;
        setDownloads(downloadsData || []);

        // Fetch remaining downloads
        const { data: remainingData, error: remainingError } = await supabase
          .rpc('get_remaining_downloads', { user_id: user.id });

        if (remainingError) throw remainingError;
        setRemainingDownloads(remainingData);
      } catch (error) {
        console.error('Error fetching downloads:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDownloads();
  }, [user]);

  const currentMonthDownloads = downloads.filter(d => 
    new Date(d.created_at).getMonth() === new Date().getMonth()
  ).length;

  const handlePreview = async (download: Download) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      
      // First check if the server is available
      const healthCheck = await fetch(`${apiUrl}/api/health`, {
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!healthCheck.ok) {
        throw new Error(`Resume preview service is not available`);
      }

      // Add watermark for free tier
      let htmlToSend = download.resume_html;
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
        htmlToSend = download.resume_html.replace('</body>', `${watermark}</body>`);
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
        throw new Error(`Failed to preview resume`);
      }

      const htmlContent = await response.text();
      
      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
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
    <>
      <ResumeBuilderNavbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {/* Subscription Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className={isFreeTier ? "text-gray-400" : "text-yellow-400"} />
              {subscription?.tier.charAt(0).toUpperCase() + subscription?.tier.slice(1)} Plan
            </CardTitle>
            <CardDescription>
              {isFreeTier ? "Free tier with basic features" : "Premium features unlocked"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFreeTier && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Monthly Downloads</span>
                    <span>{currentMonthDownloads} / 3</span>
                  </div>
                  <Progress value={(currentMonthDownloads / 3) * 100} />
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-800">
                    Upgrade to Premium for unlimited downloads and no watermarks!
                  </p>
                  <Button asChild className="mt-2 bg-purple-600 hover:bg-purple-700 hover:scale-105 transition-all duration-300 hover:cursor-pointer" onClick={handleUpgradeClick}>
                    <span>Upgrade Now</span>
                  </Button>
                </div>
              </div>
            )}
            {isPremiumTier && (
              <div className="text-green-600 flex items-center gap-2">
                <Crown />
                Unlimited downloads available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Download History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download History
            </CardTitle>
            <CardDescription>
              Your recent resume downloads
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : downloads.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No downloads yet. 
                <Link to="/resume-builder" className="text-purple-600 ml-1 hover:underline">
                  Create your first resume
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {downloads.map((download) => (
                  <div
                    key={download.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{download.resume_name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(download.created_at), 'PPP')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium uppercase bg-gray-200 px-2 py-1 rounded">
                        {download.format}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handlePreview(download)}
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
} 