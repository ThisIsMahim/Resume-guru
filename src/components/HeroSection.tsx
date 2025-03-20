
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ResumePreview from "@/components/ResumePreview";

const HeroSection = () => {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-[#ffecd2] via-[#fcb69f] to-[#ffdde1] -mt-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-lg bg-white/20 backdrop-blur-sm"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 40 - 20],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto max-w-6xl px-4 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">ResumeGuru</span> - Your Career's Best Decision
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Crafting professional resumes that open doors to opportunities. Modern, ATS-optimized, and tailored to your career goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 rounded-xl"
                  asChild
                >
                  <Link to="/resume-builder">
                    Build Your Free Resume <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </motion.div>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/70 backdrop-blur-sm hover:bg-white/90 border-gray-300 rounded-xl"
                asChild
              >
                <Link to="/resume-builder">
                  View Templates
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-700 flex items-center">
              <span className="bg-white/70 rounded-full px-3 py-1 backdrop-blur-sm">
                Takes 5 Minutes • Professional Templates • ATS-Optimized
              </span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <ResumePreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
