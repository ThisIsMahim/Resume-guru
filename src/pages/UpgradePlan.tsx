import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, CheckCircle2, Zap, Shield, Globe, Star, Bitcoin, CreditCard, Sparkles } from "lucide-react";
import ResumeBuilderNavbar from "@/components/ResumeBuilderNavbar";
import { toast } from "sonner";

const benefits = [
  {
    icon: Crown,
    title: "Premium Templates",
    description: "Access to 25+ professionally designed resume templates"
  },
  {
    icon: Shield,
    title: "No Watermarks",
    description: "Clean, professional downloads without any branding"
  },
  {
    icon: Zap,
    title: "Advanced AI Features",
    description: "Enhanced AI suggestions and job matching capabilities"
  },
  {
    icon: Globe,
    title: "Multiple Formats",
    description: "Export in PDF, DOCX, and more formats"
  },
  {
    icon: Star,
    title: "Unlimited Downloads",
    description: "Create and download as many resumes as you need"
  }
];

const paymentMethods = {
  crypto: [
    { name: "Bitcoin", icon: Bitcoin, address: "bc1q..." },
    { name: "Ethereum", icon: Bitcoin, address: "0x..." },
    { name: "Solana", icon: Bitcoin, address: "sol..." }
  ],
  traditional: [
    { name: "Payoneer", icon: CreditCard },
    { name: "bKash", icon: CreditCard, specialOffer: true },
    { name: "Nagad", icon: CreditCard, specialOffer: true }
  ]
};

export default function UpgradePlan() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");

  const handlePayment = (method: string) => {
    toast.success(`Initiating ${method} payment`, {
      description: "You'll be redirected to complete the payment."
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <ResumeBuilderNavbar />
      
      <div className="flex-grow container mx-auto py-8 px-4 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Upgrade to Premium
            </h1>
            <Sparkles className="h-8 w-8 text-pink-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Take your resume to the next level with our premium features
          </p>
        </motion.div>

        <div className="flex-grow grid lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto w-full">
          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-100">
              <h2 className="text-2xl font-semibold mb-6 text-purple-800">Premium Benefits</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 bg-white p-4 rounded-xl shadow-sm border border-purple-50"
                  >
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2.5 rounded-lg">
                      <benefit.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-purple-900">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-24"
          >
            <Card className="backdrop-blur-sm bg-white/50 border-purple-100">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-800">Choose Payment Method</CardTitle>
                <p className="text-gray-600 mt-2">
                  Special offer: Get premium features at a discounted price
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg mb-6">
                  <div className="text-sm font-medium">Premium Plan</div>
                  <div className="flex items-baseline mt-1">
                    <span className="text-3xl font-bold">$14.99</span>
                    <span className="ml-1 text-white/80">/month</span>
                  </div>
                  <div className="mt-1 text-white/90 text-sm">
                    or 50 BDT/month with bKash/Nagad
                  </div>
                </div>

                <Tabs defaultValue="traditional" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-purple-100">
                    <TabsTrigger value="traditional" className="data-[state=active]:bg-white">
                      Traditional
                    </TabsTrigger>
                    <TabsTrigger value="crypto" className="data-[state=active]:bg-white">
                      Crypto
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="traditional">
                    <div className="space-y-3 mt-4">
                      {paymentMethods.traditional.map((method, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-between h-auto py-4 bg-white hover:bg-purple-50"
                          onClick={() => handlePayment(method.name)}
                        >
                          <div className="flex items-center">
                            <method.icon className="h-5 w-5 mr-2" />
                            <span>{method.name}</span>
                          </div>
                          {method.specialOffer && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                              Special: Only 50 BDT/month
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="crypto">
                    <div className="space-y-3 mt-4">
                      {paymentMethods.crypto.map((method, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-between h-auto py-4 bg-white hover:bg-purple-50"
                          onClick={() => handlePayment(method.name)}
                        >
                          <div className="flex items-center">
                            <method.icon className="h-5 w-5 mr-2" />
                            <span>{method.name}</span>
                          </div>
                          <code className="text-sm bg-purple-50 px-2 py-1 rounded">
                            {method.address.slice(0, 6)}...{method.address.slice(-4)}
                          </code>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 text-center text-sm text-gray-500">
                  Includes 7-day money-back guarantee
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 