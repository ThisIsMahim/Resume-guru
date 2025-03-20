
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah J.",
    role: "Marketing Director",
    company: "at Google",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "Landed my dream job at Google in 2 weeks! The AI suggestions helped me highlight achievements I would have otherwise forgotten to mention.",
    stars: 5
  },
  {
    name: "Michael T.",
    role: "Software Engineer",
    company: "at Microsoft",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "ResumeGuruAI helped me quantify my technical achievements and format them perfectly. I received 3 interview requests within days.",
    stars: 5
  },
  {
    name: "Jessica L.",
    role: "Financial Analyst",
    company: "at JP Morgan",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    text: "The ATS optimization feature is a game-changer. My applications are actually getting seen by recruiters now instead of being filtered out.",
    stars: 5
  },
  {
    name: "David R.",
    role: "Product Manager",
    company: "at Amazon",
    image: "https://randomuser.me/api/portraits/men/86.jpg",
    text: "The templates are sleek and professional. I got compliments on my resume design during interviews, which never happened before!",
    stars: 5
  },
  {
    name: "Emily W.",
    role: "UX Designer",
    company: "at Netflix",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    text: "As a creative professional, I was worried about using an AI tool, but it actually helped me articulate my design process beautifully.",
    stars: 5
  }
];

const TestimonialSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals who have transformed their career prospects with ResumeGuruAI.
          </p>
        </motion.div>
        
        <Carousel className="w-full">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="border border-gray-200 h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{testimonial.name}</h3>
                          <p className="text-sm text-gray-600">{testimonial.role} {testimonial.company}</p>
                        </div>
                      </div>
                      
                      <div className="flex mb-3">
                        {[...Array(testimonial.stars)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      
                      <p className="text-gray-700 italic flex-grow">{testimonial.text}</p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:flex justify-end gap-2 mt-4">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialSection;
