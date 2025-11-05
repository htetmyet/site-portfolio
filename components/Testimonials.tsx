import React, { useState, useEffect } from 'react';
import type { Testimonial } from '../types';

const testimonialsData: Testimonial[] = [
  {
    quote: "QuantumLeap AI transformed our operations. Their custom model is the most impactful tech we've adopted this decade.",
    author: 'Jane Doe',
    company: 'CEO, Innovate Corp',
  },
  {
    quote: "The insights we gained from their data analytics platform were game-changing. We now make decisions with unprecedented confidence.",
    author: 'John Smith',
    company: 'CTO, DataDriven Inc.',
  },
  {
    quote: "A truly professional and brilliant team. They delivered beyond our expectations on a very complex automation project.",
    author: 'Emily White',
    company: 'COO, Global Logistics',
  },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === testimonialsData.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-brand-surface to-brand-bg-light-alt relative overflow-hidden">
      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">What Our Clients Say</h2>
        <div className="relative max-w-3xl mx-auto h-48">
          {testimonialsData.map((testimonial, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'}`}
            >
              <p className="text-xl italic text-brand-text-muted mb-4">"{testimonial.quote}"</p>
              <p className="font-bold text-brand-primary">{testimonial.author}</p>
              <p className="text-sm text-brand-text-muted/80">{testimonial.company}</p>
            </div>
          ))}
        </div>
         <div className="absolute -top-10 -left-10 z-0">
            <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M49.25 0C43.625 15.3333 34.625 28 22.25 38C22.25 25.3333 16.0833 13.5 3.75 2.5V50.5C19.0833 50.5 28.25 56.6667 31.25 69H0V100H50.5V50.5C50.5 33.8333 50.1667 16.6667 49.25 0Z" fill="url(#paint0_linear_1_2)"/>
                <defs>
                    <linearGradient id="paint0_linear_1_2" x1="25.25" y1="0" x2="25.25" y2="100" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#22C55E" stopOpacity="0.1"/>
                        <stop offset="1" stopColor="#86EFAC" stopOpacity="0.01"/>
                    </linearGradient>
                </defs>
            </svg>
        </div>
         <div className="absolute -bottom-10 -right-10 z-0 transform rotate-180">
            <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M49.25 0C43.625 15.3333 34.625 28 22.25 38C22.25 25.3333 16.0833 13.5 3.75 2.5V50.5C19.0833 50.5 28.25 56.6667 31.25 69H0V100H50.5V50.5C50.5 33.8333 50.1667 16.6667 49.25 0Z" fill="url(#paint0_linear_1_3)"/>
                <defs>
                    <linearGradient id="paint0_linear_1_3" x1="25.25" y1="0" x2="25.25" y2="100" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#22C55E" stopOpacity="0.1"/>
                        <stop offset="1" stopColor="#86EFAC" stopOpacity="0.01"/>
                    </linearGradient>
                </defs>
            </svg>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;