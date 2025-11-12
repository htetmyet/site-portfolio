import React, { useState } from 'react';
import type { SiteSettings } from '../types';
import { sendContactMessage } from '../services/apiClient';

interface ContactFormProps {
  settings: SiteSettings;
}

const ContactForm: React.FC<ContactFormProps> = ({ settings }) => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formStatus === 'sending') return;
    setFormStatus('sending');
    setFormError('');
    try {
      await sendContactMessage({
        name: formState.name.trim(),
        email: formState.email.trim(),
        message: formState.message.trim(),
      });
      setFormStatus('success');
      setFormState({ name: '', email: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (error: any) {
      setFormStatus('error');
      setFormError(error.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section id="contact" className="py-20 bg-brand-bg-light">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-brand-border bg-brand-surface/80 p-8 shadow-sm backdrop-blur">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Let's Build Together</h2>
          <p className="text-brand-text-muted mb-2">Have a project in mind or just want to learn more? Drop us a line.</p>
          <p className="text-brand-text-muted text-sm mb-8">
            Email us at <a className="text-brand-primary font-semibold" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
            {settings.contactPhone ? <> or call us at <span className="font-medium">{settings.contactPhone}</span></> : null}
          </p>
          <form onSubmit={handleFormSubmit} noValidate>
            <div className="mb-4">
              <input type="text" name="name" placeholder="Your Name" value={formState.name} onChange={handleFormChange} required className="w-full p-3 bg-brand-bg-light text-brand-text-dark border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors" />
            </div>
            <div className="mb-4">
              <input type="email" name="email" placeholder="Your Email" value={formState.email} onChange={handleFormChange} required className="w-full p-3 bg-brand-bg-light text-brand-text-dark border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors" />
            </div>
            <div className="mb-4">
              <textarea name="message" placeholder="Your Message" value={formState.message} onChange={handleFormChange} required rows={5} className="w-full p-3 bg-brand-bg-light text-brand-text-dark border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors"></textarea>
            </div>
            <button type="submit" disabled={formStatus === 'sending'} className="w-full px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg font-bold text-white hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
            <div className="mt-4 min-h-[1.5rem]" aria-live="polite">
              {formStatus === 'success' && <p className="text-green-600 text-center">Thank you! Your message has been sent.</p>}
              {formStatus === 'error' && <p className="text-red-500 text-center">{formError || 'Something went wrong. Please try again.'}</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
