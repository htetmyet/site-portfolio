import React, { useState } from 'react';
import { generateAIdea } from '../services/geminiService';
import type { GeneratedIdea, SiteSettings } from '../types';
import { LightbulbIcon } from './icons';

const cardColors = [
    'border-brand-primary',
    'border-brand-accent',
    'border-brand-accent-teal',
];

const IdeaCard: React.FC<{ idea: GeneratedIdea; index: number }> = ({ idea, index }) => (
    <div className={`bg-brand-bg-light p-4 rounded-lg border-l-4 ${cardColors[index % cardColors.length]} animate-fade-in`}>
        <h4 className="font-bold text-brand-primary">{idea.name}</h4>
        <p className="text-sm text-brand-text-muted mt-1">{idea.summary}</p>
        <p className="text-xs text-brand-text-muted/80 mt-2">Key Tech: {idea.technology}</p>
    </div>
);

interface ContactFormProps {
  settings: SiteSettings;
}

const ContactForm: React.FC<ContactFormProps> = ({ settings }) => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const [industry, setIndustry] = useState('');
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [ideaStatus, setIdeaStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [ideaError, setIdeaError] = useState('');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    // Mock submission
    setTimeout(() => {
        console.log('Form submitted:', formState);
        setFormStatus('success');
        setFormState({ name: '', email: '', message: '' });
        setTimeout(() => setFormStatus('idle'), 5000);
    }, 1500);
  };

  const handleIdeaGeneration = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!industry) return;
      setIdeaStatus('loading');
      setIdeas([]);
      setIdeaError('');
      try {
          const result = await generateAIdea(industry);
          setIdeas(result);
          setIdeaStatus('success');
      } catch (err: any) {
          setIdeaStatus('error');
          setIdeaError(err.message || 'An unknown error occurred.');
      }
  };

  return (
    <section id="contact" className="py-20 bg-brand-bg-light">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
        {/* Contact Form */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Let's Build Together</h2>
          <p className="text-brand-text-muted mb-2">Have a project in mind or just want to learn more? Drop us a line.</p>
          <p className="text-brand-text-muted text-sm mb-8">
            Email us at <a className="text-brand-primary font-semibold" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
            {settings.contactPhone ? <> or call us at <span className="font-medium">{settings.contactPhone}</span></> : null}
          </p>
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <input type="text" name="name" placeholder="Your Name" value={formState.name} onChange={handleFormChange} required className="w-full p-3 bg-brand-surface text-brand-text-dark border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors" />
            </div>
            <div className="mb-4">
              <input type="email" name="email" placeholder="Your Email" value={formState.email} onChange={handleFormChange} required className="w-full p-3 bg-brand-surface text-brand-text-dark border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors" />
            </div>
            <div className="mb-4">
              <textarea name="message" placeholder="Your Message" value={formState.message} onChange={handleFormChange} required rows={5} className="w-full p-3 bg-brand-surface text-brand-text-dark border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors"></textarea>
            </div>
            <button type="submit" disabled={formStatus === 'sending'} className="w-full px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg font-bold text-white hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            {formStatus === 'success' && <p className="text-green-500 mt-4 text-center">Thank you! Your message has been sent.</p>}
            {formStatus === 'error' && <p className="text-red-500 mt-4 text-center">Something went wrong. Please try again.</p>}
          </form>
        </div>

        {/* AI Idea Generator */}
        <div className="bg-brand-surface p-8 rounded-lg border border-brand-border">
            <div className="flex items-center mb-4">
                <LightbulbIcon className="w-8 h-8 text-brand-accent-orange mr-3" />
                <div>
                    <h3 className="text-2xl font-bold">AI Idea Generator</h3>
                    <p className="text-brand-text-muted text-sm">Powered by Gemini</p>
                </div>
            </div>
            <p className="text-brand-text-muted mb-6">Unsure where to start? Enter your industry to get AI-powered ideas for your business.</p>
            <form onSubmit={handleIdeaGeneration}>
                <div className="flex gap-2">
                    <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., Healthcare, Retail, Finance" className="flex-grow p-3 bg-brand-bg-light text-brand-text-dark border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors" />
                    <button type="submit" disabled={ideaStatus === 'loading'} className="px-6 py-3 bg-brand-accent rounded-lg font-bold text-white hover:opacity-90 transition-opacity duration-300 disabled:opacity-50">
                        {ideaStatus === 'loading' ? '...' : 'Generate'}
                    </button>
                </div>
            </form>
            <div className="mt-6 space-y-4">
                {ideaStatus === 'loading' && <p className="text-center text-brand-text-muted">Generating brilliant ideas...</p>}
                {ideaStatus === 'error' && <p className="text-red-500 text-center">{ideaError}</p>}
                {ideaStatus === 'success' && ideas.map((idea, index) => <IdeaCard key={index} idea={idea} index={index} />)}
            </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
