import React, { useEffect } from 'react';
import type { Project } from '../types';

const tagColors = [
  'bg-brand-primary/80 text-white',
  'bg-brand-accent/80 text-white',
  'bg-brand-accent-teal/80 text-white',
  'bg-brand-accent-orange/80 text-white',
];


interface PortfolioProps {
  projects: Project[];
}

const placeholderImage = 'https://picsum.photos/800/600?random=40';

const Portfolio: React.FC<PortfolioProps> = ({ projects }) => {
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
        {projects.length === 0 ? (
          <p className="text-center text-brand-text-muted">More case studies are on the way.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              const tags = Array.isArray(project.tags) ? project.tags : [];
              return (
                <div
                  key={project.id ?? index}
                  className="portfolio-card group relative overflow-hidden rounded-lg shadow-xl opacity-0 scale-95 transition-all duration-700 ease-out"
                >
                <img
                  src={project.imageUrl || placeholderImage}
                  alt={project.title}
                  className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white w-full bg-black/20 backdrop-blur-sm group-hover:bg-black/40 group-hover:backdrop-blur-md rounded-t-lg transition-all duration-500">
                  <p className="text-sm font-semibold text-brand-secondary mb-1">{project.category}</p>
                  <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                  <div className="max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500">
                    <p className="text-gray-200 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, tagIndex) => (
                        <span
                          key={`${project.id ?? project.title}-${tag}`}
                          className={`${tagColors[tagIndex % tagColors.length]} text-xs font-semibold px-3 py-1 rounded-full transition-transform hover:scale-110`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
