import React, { useEffect, useState } from 'react';
import type { HeroSlide } from '../../types';

interface HeroSlidesFormProps {
  heroSlides: HeroSlide[];
  onSave: (slides: HeroSlide[]) => Promise<void>;
  saving: boolean;
}

const emptySlide: HeroSlide = {
  title: '',
  subtitle: '',
  imageUrl: '',
};

const HeroSlidesForm: React.FC<HeroSlidesFormProps> = ({ heroSlides, onSave, saving }) => {
  const [slides, setSlides] = useState<HeroSlide[]>(heroSlides.length ? heroSlides : [emptySlide]);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setSlides(heroSlides.length ? heroSlides : [emptySlide]);
  }, [heroSlides]);

  const handleSlideChange = (index: number, field: keyof HeroSlide, value: string) => {
    setSlides((prev) => prev.map((slide, idx) => (idx === index ? { ...slide, [field]: value } : slide)));
  };

  const addSlide = () => setSlides((prev) => [...prev, { ...emptySlide }]);
  const removeSlide = (index: number) => setSlides((prev) => prev.filter((_, idx) => idx !== index));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    try {
      await onSave(
        slides
          .filter((slide) => slide.title && slide.subtitle)
          .map((slide, index) => ({ ...slide, order: index })),
      );
      setStatus({ type: 'success', message: 'Hero slides updated.' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to update hero slides.' });
    }
  };

  return (
    <section className="rounded-xl border border-brand-border bg-brand-surface p-6 shadow-sm">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-brand-text-dark">Hero Slides</h2>
          <p className="text-sm text-brand-text-muted">Control the messaging, visuals, and order of your hero carousel.</p>
        </div>
        <button
          type="button"
          onClick={addSlide}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90"
        >
          Add Slide
        </button>
      </header>

      {status && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            status.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {slides.map((slide, index) => (
          <div key={index} className="rounded-lg border border-brand-border bg-brand-bg-light-alt p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-brand-text-dark">Slide #{index + 1}</p>
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSlide(index)}
                  className="text-xs font-semibold text-brand-accent hover:text-brand-accent/80"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                placeholder="Supertitle"
                value={slide.supertitle ?? ''}
                onChange={(event) => handleSlideChange(index, 'supertitle', event.target.value)}
                className="rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
              <input
                required
                placeholder="Title"
                value={slide.title}
                onChange={(event) => handleSlideChange(index, 'title', event.target.value)}
                className="rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
            <textarea
              required
              placeholder="Subtitle"
              value={slide.subtitle}
              onChange={(event) => handleSlideChange(index, 'subtitle', event.target.value)}
              rows={2}
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none resize-none"
            />
            <input
              placeholder="Background image URL"
              value={slide.imageUrl ?? ''}
              onChange={(event) => handleSlideChange(index, 'imageUrl', event.target.value)}
              className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            />
          </div>
        ))}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-brand-primary px-6 py-2 font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Hero Slides'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default HeroSlidesForm;
