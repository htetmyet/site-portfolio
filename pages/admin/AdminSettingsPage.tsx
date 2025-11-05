import React, { useEffect, useState } from 'react';
import GeneralSettingsForm from '../../components/admin/GeneralSettingsForm';
import HeroSlidesForm from '../../components/admin/HeroSlidesForm';
import ServicesManager from '../../components/admin/ServicesManager';
import type { HeroSlide, Service, SiteSettings } from '../../types';
import {
  fetchServices,
  fetchSettings,
  updateGeneralSettings,
  updateHeroSlides,
  createService,
  updateService,
  deleteService,
} from '../../services/apiClient';

const AdminSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [services, setServicesState] = useState<Service[]>([]);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingHero, setSavingHero] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [settingsResp, servicesResp] = await Promise.all([fetchSettings(), fetchServices()]);
        if (!isMounted) return;
        setSettings(settingsResp.settings);
        setHeroSlides(settingsResp.heroSlides);
        setServicesState(servicesResp);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Unable to load settings');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGeneralSave = async (updatedSettings: SiteSettings): Promise<SiteSettings> => {
    setSavingGeneral(true);
    setError('');
    try {
      const response = await updateGeneralSettings(updatedSettings);
      setSettings(response);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to update general settings');
      throw err;
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleHeroSave = async (slides: HeroSlide[]) => {
    setSavingHero(true);
    setError('');
    try {
      const response = await updateHeroSlides(slides);
      setHeroSlides(response.heroSlides);
    } catch (err: any) {
      setError(err.message || 'Failed to update hero slides');
      throw err;
    } finally {
      setSavingHero(false);
    }
  };

  const handleCreateService = async (service: Service) => {
    const created = await createService(service);
    setServicesState((prev) => [...prev, created]);
    return created;
  };

  const handleUpdateService = async (id: number, service: Service) => {
    const updated = await updateService(id, service);
    setServicesState((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  };

  const handleDeleteService = async (id: number) => {
    await deleteService(id);
    setServicesState((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-text-muted">
          Loading settings...
        </div>
      )}

      {!loading && settings && (
        <>
          <GeneralSettingsForm settings={settings} onSave={handleGeneralSave} saving={savingGeneral} />
          <HeroSlidesForm heroSlides={heroSlides} onSave={handleHeroSave} saving={savingHero} />
          <ServicesManager
            services={services}
            onCreate={handleCreateService}
            onUpdate={handleUpdateService}
            onDelete={handleDeleteService}
          />
        </>
      )}
    </div>
  );
};

export default AdminSettingsPage;
