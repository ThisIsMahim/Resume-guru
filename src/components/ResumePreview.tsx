
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const ResumePreview = () => {
  return (
    <div className="relative h-[500px] perspective-1000">
      {/* Floating resume templates */}
      <motion.div
        className="absolute top-0 right-0 z-20"
        initial={{ y: 20, x: 10, rotate: 5 }}
        animate={{ y: 0, x: 0, rotate: 0 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <Card className="w-64 h-80 shadow-xl rounded-lg overflow-hidden border-2 border-white">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-purple-100 to-indigo-50 p-4 h-full">
              <div className="bg-white rounded-lg h-12 w-32 mb-3" />
              <div className="bg-white/80 rounded-lg h-4 w-full mb-2" />
              <div className="bg-white/80 rounded-lg h-4 w-5/6 mb-2" />
              <div className="bg-white/80 rounded-lg h-4 w-4/6 mb-4" />
              
              <div className="bg-indigo-100 rounded-lg p-2 mb-3">
                <div className="bg-white/80 rounded-lg h-3 w-full mb-1" />
                <div className="bg-white/80 rounded-lg h-3 w-5/6" />
              </div>
              
              <div className="bg-white/80 rounded-lg h-4 w-full mb-2" />
              <div className="bg-white/80 rounded-lg h-4 w-full mb-2" />
              <div className="bg-white/80 rounded-lg h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Primary resume template */}
      <motion.div
        className="absolute top-10 left-0 z-10"
        initial={{ y: -10, rotate: -3 }}
        animate={{ y: 10, rotate: 0 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <Card className="w-72 h-96 shadow-2xl rounded-lg overflow-hidden border-2 border-white">
          <CardContent className="p-0">
            <div className="bg-gradient-to-b from-white to-gray-50 p-4 h-full">
              <div className="flex justify-between mb-4">
                <div>
                  <div className="bg-pink-500 h-6 w-40 rounded mb-1" />
                  <div className="bg-gray-300 h-3 w-32 rounded" />
                </div>
                <div className="bg-gray-200 h-12 w-12 rounded-full" />
              </div>
              
              <div className="mb-4">
                <div className="bg-gray-200 h-4 w-20 rounded mb-2" />
                <div className="bg-gray-100 h-3 w-full rounded mb-1" />
                <div className="bg-gray-100 h-3 w-full rounded mb-1" />
                <div className="bg-gray-100 h-3 w-4/5 rounded" />
              </div>
              
              <div className="mb-4">
                <div className="bg-gray-200 h-4 w-24 rounded mb-2" />
                <div className="bg-gray-100 h-3 w-full rounded mb-1" />
                <div className="bg-gray-100 h-3 w-full rounded mb-1" />
                <div className="bg-gray-100 h-3 w-3/4 rounded" />
              </div>
              
              <div>
                <div className="bg-gray-200 h-4 w-28 rounded mb-2" />
                <div className="flex justify-between mb-1">
                  <div className="bg-gray-100 h-3 w-2/5 rounded" />
                  <div className="bg-gray-100 h-3 w-2/5 rounded" />
                </div>
                <div className="flex justify-between mb-1">
                  <div className="bg-gray-100 h-3 w-2/5 rounded" />
                  <div className="bg-gray-100 h-3 w-2/5 rounded" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Background resume template */}
      <motion.div
        className="absolute bottom-0 right-10 z-0"
        initial={{ y: 10, x: -10, rotate: 5 }}
        animate={{ y: -10, x: 10, rotate: 2 }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <Card className="w-60 h-72 shadow-lg rounded-lg overflow-hidden border-2 border-white opacity-70">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 h-full">
              <div className="bg-white rounded-lg h-8 w-40 mb-3" />
              <div className="bg-white/80 rounded-lg h-3 w-full mb-1" />
              <div className="bg-white/80 rounded-lg h-3 w-4/5 mb-3" />
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <div className="bg-white/80 rounded-lg h-3 w-full mb-1" />
                  <div className="bg-white/80 rounded-lg h-3 w-4/5" />
                </div>
                <div>
                  <div className="bg-white/80 rounded-lg h-3 w-full mb-1" />
                  <div className="bg-white/80 rounded-lg h-3 w-3/4" />
                </div>
              </div>
              
              <div className="bg-white/80 rounded-lg h-3 w-full mb-1" />
              <div className="bg-white/80 rounded-lg h-3 w-full mb-1" />
              <div className="bg-white/80 rounded-lg h-3 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Floating badges */}
      <motion.div 
        className="absolute -bottom-5 left-10 z-30 bg-white shadow-lg rounded-full px-4 py-2 flex items-center"
        initial={{ y: 10, opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <div className="bg-green-500 rounded-full w-3 h-3 mr-2" />
        <span className="text-sm font-medium">ATS Optimized</span>
      </motion.div>
      
      <motion.div 
        className="absolute top-1/3 -right-5 z-30 bg-white shadow-lg rounded-full px-4 py-2 flex items-center"
        initial={{ x: 10, opacity: 0.5 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <div className="bg-purple-500 rounded-full w-3 h-3 mr-2" />
        <span className="text-sm font-medium">AI Enhanced</span>
      </motion.div>
    </div>
  );
};

export default ResumePreview;
