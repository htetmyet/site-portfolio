import React, { useEffect } from 'react';
import type { Project } from '../types';

const portfolioData: Project[] = [
  {
    image: 'https://picsum.photos/800/600?random=4',
    category: 'Predictive Analytics',
    title: 'Project Sentinel',
    description: 'Developed a predictive security system for a major logistics firm, reducing incidents by 35%.',
    tags: ['Machine Learning', 'Data Visualization', 'Python'],
  },
  {
    image: 'https://picsum.photos/800/600?random=5',
    category: 'Natural Language Processing',
    title: 'Echo AI Chatbot',
    description: 'A customer service chatbot that resolved 80% of inquiries without human intervention, improving customer satisfaction.',
    tags: ['NLP', 'React', 'Cloud AI'],
  },
  {
    image: 'https://picsum.photos/800/600?random=6',
    category: 'Computer Vision',
    title: 'Visionary QC',
    description: 'An automated quality control system for manufacturing, using computer vision to detect defects in real-time.',
    tags: ['Computer Vision', 'IoT', 'Edge Computing'],
  },
];

const tagColors = [
  'bg-brand-primary/80 text-white',
  'bg-brand-accent/80 text-white',
  'bg-brand-accent-teal/80 text-white',
  'bg-brand-accent-orange/80 text-white',
];


const Portfolio = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'scale-95');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.portfolio-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="portfolio" className="py-20 bg-brand-surface">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Our Work</h2>
        <p className="max-w-3xl mx-auto text-brand-text-muted text-center mb-12">
          We take pride in delivering intelligent solutions that create real value.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioData.map((project, index) => (
            <div key={index} className="portfolio-card group relative overflow-hidden rounded-lg shadow-xl opacity-0 scale-95 transition-all duration-700 ease-out">
              <img src={project.image} alt={project.title} className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white w-full bg-black/20 backdrop-blur-sm group-hover:bg-black/40 group-hover:backdrop-blur-md rounded-t-lg transition-all duration-500">
                <p className="text-sm font-semibold text-brand-secondary mb-1">{project.category}</p>
                <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                <div className="max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500">
                  <p className="text-gray-200 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <span key={tag} className={`${tagColors[tagIndex % tagColors.length]} text-xs font-semibold px-3 py-1 rounded-full transition-transform hover:scale-110`}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;