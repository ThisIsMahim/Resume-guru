import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const AboutSection = () => {
  const [totalDownloads, setTotalDownloads] = useState<number>(0);

  useEffect(() => {
    const fetchTotalDownloads = async () => {
      try {
        const { count, error } = await supabase
          .from('downloads')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        setTotalDownloads(count || 0);
      } catch (error) {
        console.error('Error fetching total downloads:', error);
      }
    };

    fetchTotalDownloads();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const statVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const featureVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section id="about" className="py-16 px-4 md:px-8 bg-white">
      <motion.div
        className="container mx-auto max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 
          variants={itemVariants}
          className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
        >
          About ResumeGuru
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
          >
            <motion.h3 
              variants={itemVariants}
              className="text-2xl font-semibold text-gray-800"
            >
              Your Career Journey, Our Expertise
            </motion.h3>
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 leading-relaxed"
            >
              ResumeGuru was founded with a simple yet powerful mission: to help job seekers create professional, 
              ATS-optimized resumes that stand out in today's competitive job market.
            </motion.p>
            <motion.p 
              variants={itemVariants}
              className="text-gray-600 leading-relaxed"
            >
              Our platform combines cutting-edge AI technology with proven resume-writing best practices to ensure 
              your professional story is told in the most compelling way possible.
            </motion.p>
            <motion.div 
              className="grid grid-cols-2 gap-4 mt-8"
              variants={containerVariants}
            >
              <motion.div 
                className="bg-purple-50 p-4 rounded-lg text-center"
                variants={statVariants}
                whileHover={{ scale: 1.05 }}
              >
                <h4 className="text-3xl font-bold text-purple-600">
                  {totalDownloads > 1000 
                    ? `${(totalDownloads / 1000).toFixed(1)}K+` 
                    : `${totalDownloads}+`}
                </h4>
                <p className="text-sm text-gray-600">Resumes Created</p>
              </motion.div>
              <motion.div 
                className="bg-pink-50 p-4 rounded-lg text-center"
                variants={statVariants}
                whileHover={{ scale: 1.05 }}
              >
                <h4 className="text-3xl font-bold text-pink-600">100%</h4>
                <p className="text-sm text-gray-600">Success Rate</p>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div 
            className="relative"
            variants={containerVariants}
          >
            <motion.div 
              className="bg-gradient-to-r from-pink-200 to-purple-200 rounded-2xl p-8"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h4 
                variants={itemVariants}
                className="text-xl font-semibold mb-4"
              >
                Why Choose ResumeGuru?
              </motion.h4>
              <motion.ul 
                className="space-y-4"
                variants={containerVariants}
              >
                {[
                  "AI-powered content optimization",
                  "ATS-friendly templates",
                  "Real-time preview and editing",
                  "Expert-designed templates"
                ].map((feature, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start"
                    variants={featureVariants}
                    custom={index}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default AboutSection;

