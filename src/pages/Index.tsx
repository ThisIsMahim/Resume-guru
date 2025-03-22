import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import PricingSection from "@/components/PricingSection";
import ResumeBuilderNavbar from "@/components/ResumeBuilderNavbar";
import AboutSection from "@/components/AboutSection";
import HelpSection from "@/components/HelpSection";

const Index = () => {
  const [isHovering, setIsHovering] = useState(false);

  const handleGetStarted = () => {
    toast.success("Welcome to ResumeGuru!", {
      description: "Let's create your perfect resume together!"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ResumeBuilderNavbar />
      {/* Hero Section */}
      <HeroSection />
      
      {/* Feature Section */}
      <FeatureSection />
      
      {/* How It Works */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            How ResumeGuru Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Input Your Details</h3>
              <p className="text-gray-600">Share your experience and skills with our intuitive form and AI assistant.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Enhancement</h3>
              <p className="text-gray-600">Our AI analyzes and enhances your content for maximum impact and ATS optimization.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Download & Apply</h3>
              <p className="text-gray-600">Get your polished, professional resume ready to help you land your dream job.</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleGetStarted}
                className="px-8 py-6 text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl"
                asChild
              >
                <Link to="/resume-builder">
                  Build Your Free Resume <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </motion.div>
            <p className="mt-4 text-sm text-gray-500">Takes 5 Minutes • Professional Templates • ATS-Optimized</p>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <AboutSection/>
      
      {/* Pricing Section */}
      <PricingSection />
      
      {/* Trust Badges */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center">
              <Shield className="text-green-500 mr-2" />
              <span className="text-sm font-medium">256-bit encryption</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-2" />
              <span className="text-sm font-medium">ATS-Optimized</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-2" />
              <span className="text-sm font-medium">HR-Approved Templates</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-2" />
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Help Section */}
      <HelpSection />
      
      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <img src="/favicon.ico" alt="ResumeGuru" className="w-8 h-8" />
                <h3 className="text-xl font-bold">ResumeGuru</h3>
              </div>
              <p className="text-gray-400">"Your career's best decision."</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/resume-builder" className="text-gray-400 hover:text-white transition">Create Resume</Link></li>
                <li><Link to="/upgrade" className="text-gray-400 hover:text-white transition">Premium Features</Link></li>
                <li><Link to="/#pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/#about" className="text-gray-400 hover:text-white transition">About</Link></li>
                <li><Link to="/#help" className="text-gray-400 hover:text-white transition">Contact</Link></li>
                <li><a href="mailto:support@resumeguru.com" className="text-gray-400 hover:text-white transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-gray-400 hover:text-white transition">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} ResumeGuru. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
