import React from 'react';
import type { Service } from '../types';
import { BrainCircuitIcon, BarChartIcon, BotIcon, LightbulbIcon } from './icons';

const iconColorClasses: Record<string, string> = {
    green: 'bg-brand-primary/10',
    blue: 'bg-brand-accent/10',
    teal: 'bg-brand-accent-teal/10',
    orange: 'bg-brand-accent-orange/10',
};

const borderColorClasses: Record<string, string> = {
    green: 'hover:border-brand-primary',
    blue: 'hover:border-brand-accent',
    teal: 'hover:border-brand-accent-teal',
    orange: 'hover:border-brand-accent-orange',
};

const iconMap = {
  brain: BrainCircuitIcon,
  analytics: BarChartIcon,
  automation: BotIcon,
  custom: LightbulbIcon,
};

interface ServicesProps {
  services: Service[];
}

const Services: React.FC<ServicesProps> = ({ services }) => {
  return (
    <section id="services" className="py-20 bg-brand-bg-light-alt">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Services</h2>
        <p className="max-w-3xl mx-auto text-brand-text-muted mb-12">We provide end-to-end AI solutions that drive growth and innovation.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const colorKey = service.color ?? 'green';
            const IconComponent = iconMap[service.iconKey ?? 'custom'] ?? LightbulbIcon;
            return (
            <div key={service.id ?? index} className={`bg-brand-surface p-8 rounded-lg shadow-lg border-2 border-transparent transform hover:-translate-y-2 transition-all duration-300 group ${borderColorClasses[colorKey] ?? ''}`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${iconColorClasses[colorKey] ?? 'bg-brand-primary/10'}`}>
                  <IconComponent className="h-10 w-10 text-brand-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-brand-text-muted">{service.description}</p>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
};

export default Services;
