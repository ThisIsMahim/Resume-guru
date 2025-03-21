import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, X } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Basic resume creation for job seekers",
    features: [
      "3 resumes per month",
      "3 basic templates",
      "ATS compatibility check",
      "Download as PDF (with watermark)",
      "Basic AI suggestions"
    ],
    limitations: [
      "Limited to 3 downloads per month",
      "Limited template options",
      "No keyword optimization",
      "No custom sections",
      "Includes watermark",
      "No AI job description matcher"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Premium",
    price: "14.99",
    description: "Advanced features for serious job hunters",
    features: [
      "Unlimited resumes",
      "25+ premium templates",
      "Advanced ATS optimization",
      "Multi-format downloads (PDF, DOCX, TXT)",
      "AI content enhancement",
      "Keyword optimization",
      "Custom sections",
      "No watermarks",
      "Cover letter builder",
      "AI job description matcher"
    ],
    limitations: [],
    cta: "Upgrade Now",
    popular: true
  },
  {
    name: "Business",
    price: "99.99",
    description: "For recruiters and career coaches",
    features: [
      "Everything in Premium",
      "Team management",
      "Client dashboard",
      "Bulk resume processing",
      "White-label exports",
      "API access",
      "Priority support",
      "Analytics dashboard"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false
  }
];

const PricingSection = () => {
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  return (
    <section id="pricing" className="py-16 px-4 md:px-8 bg-white">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
          
          <div className="flex justify-center mt-6">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  billingPeriod === "monthly"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setBillingPeriod("monthly")}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  billingPeriod === "annual"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setBillingPeriod("annual")}
              >
                Annual <span className="text-green-600 text-xs font-bold">Save 20%</span>
              </button>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={plan.popular ? { scale: 1.03 } : { scale: 1.01 }}
              className="flex"
            >
              <Card className={`w-full border ${
                plan.popular 
                  ? "border-purple-300 shadow-lg shadow-purple-100" 
                  : "border-gray-200"
              }`}>
                {plan.popular && (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-t-lg text-center">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${billingPeriod === "annual" && plan.price !== "0" ? (Number(plan.price) * 0.8).toFixed(2) : plan.price}</span>
                    {plan.price !== "0" && <span className="text-gray-500">/{billingPeriod === "annual" ? "mo, billed annually" : "month"}</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <h4 className="font-medium mb-2 text-gray-900">Includes:</h4>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <>
                      <h4 className="font-medium mb-2 text-gray-900">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, i) => (
                          <li key={i} className="flex items-start">
                            <X className="w-5 h-5 text-gray-400 mt-0.5 mr-2 shrink-0" />
                            <span className="text-gray-500">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" 
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/resume-builder">
                      {plan.cta}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            All plans include a 7-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
