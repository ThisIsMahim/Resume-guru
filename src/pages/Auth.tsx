import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, ArrowRight, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, signIn, signUp, signOut, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/resume-builder");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, { full_name: fullName });
        toast.success("Account created successfully!");
      } else {
        await signIn(email, password);
        toast.success("Welcome back!");
      }
      navigate("/resume-builder");
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(err.message || "Authentication failed. Please try again.");
      toast.error("Authentication failed", {
        description: err.message || "Please check your credentials and try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google sign in error:", err);
      toast.error("Google sign in failed", {
        description: err.message || "Please try again later."
      });
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setEmail("");
    setPassword("");
    setFullName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent" />
            <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              ResumeGuru
            </span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                {isSignUp ? "Create an Account" : "Welcome Back"}
              </h2>
              <p className="text-center text-gray-600 mb-8">
                {isSignUp
                  ? "Join ResumeGuru to create your perfect resume"
                  : "Continue your resume journey"}
              </p>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : isSignUp ? (
                    <>
                      Create Account <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-6 flex items-center justify-center space-x-2"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  <button
                    onClick={toggleMode}
                    className="ml-2 text-pink-600 hover:text-pink-700 font-medium transition-colors"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
