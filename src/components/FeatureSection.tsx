
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Award, 
  Sparkles, 
  Cpu, 
  FileText, 
  LayoutTemplate,
  Download
} from "lucide-react";

const features = [
  {
    icon: <Sparkles className="h-6 w-6 text-purple-600" />,
    title: "AI-Powered Writing",
    description: "Our AI helps you craft compelling descriptions of your experience and skills that grab attention."
  },
  {
    icon: <FileText className="h-6 w-6 text-pink-600" />,
    title: "ATS Optimization",
    description: "We analyze your resume against job descriptions to ensure it passes applicant tracking systems."
  },
  {
    icon: <LayoutTemplate className="h-6 w-6 text-indigo-600" />,
    title: "Beautiful Templates",
    description: "Choose from dozens of HR-approved, customizable templates for any industry or career level."
  },
  {
    icon: <Award className="h-6 w-6 text-amber-600" />,
    title: "Real-Time Feedback",
    description: "Get instant suggestions for improvement as you build your resume from our AI coach."
  },
  {
    icon: <Cpu className="h-6 w-6 text-emerald-600" />,
    title: "Keyword Optimization",
    description: "We identify and include industry-specific keywords to help your resume stand out."
  },
  {
    icon: <Download className="h-6 w-6 text-blue-600" />,
    title: "Multi-Format Export",
    description: "Download your resume as PDF, DOCX, or TXT, or share directly to job application platforms."
  }
];

const FeatureSection = () => {
  return (
    <section className="py-16 px-4 md:px-8 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Features That Make Your Resume Stand Out
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Our AI-powered tools help you create a resume that gets noticed by both humans and algorithms.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full border border-gray-200 hover:border-purple-200 transition-all hover:shadow-md overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4 bg-gray-50 w-12 h-12 rounded-lg flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
