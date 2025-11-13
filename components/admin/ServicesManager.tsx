import React, { useEffect, useState } from 'react';
import type { Service } from '../../types';

interface ServicesManagerProps {
  services: Service[];
  onCreate: (service: Service) => Promise<Service>;
  onUpdate: (id: number, service: Service) => Promise<Service>;
  onDelete: (id: number) => Promise<void>;
}

const serviceColors = ['green', 'blue', 'teal', 'orange'];
const iconOptions = [
  { value: 'brain', label: 'Brain Circuit' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'automation', label: 'Automation' },
  { value: 'cloud', label: 'Cloud Intelligence' },
  { value: 'shield', label: 'Secure AI' },
  { value: 'spark', label: 'Generative Spark' },
  { value: 'vision', label: 'Computer Vision' },
  { value: 'custom', label: 'Custom' },
];

const ServicesManager: React.FC<ServicesManagerProps> = ({ services, onCreate, onUpdate, onDelete }) => {
  const [editableServices, setEditableServices] = useState<Service[]>(services);
  const [newService, setNewService] = useState<Service>({
    title: '',
    description: '',
    color: 'green',
    iconKey: 'custom',
  });
  const [pendingId, setPendingId] = useState<number | 'new' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setEditableServices(services);
  }, [services]);

  const handleUpdateChange = (index: number, field: keyof Service, value: string | number) => {
    setEditableServices((prev) =>
      prev.map((service, idx) => (idx === index ? { ...service, [field]: value } : service)),
    );
  };

  const saveService = async (service: Service) => {
    if (!service.id) return;
    setPendingId(service.id);
    setMessage(null);
    try {
      await onUpdate(service.id, service);
      setMessage({ type: 'success', text: `Service "${service.title}" updated.` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update service' });
    } finally {
      setPendingId(null);
    }
  };

  const createService = async () => {
    if (!newService.title || !newService.description) return;
    setPendingId('new');
    setMessage(null);
    try {
      await onCreate(newService);
      setNewService({ title: '', description: '', color: 'green', iconKey: 'custom' });
      setMessage({ type: 'success', text: 'Service created.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create service' });
    } finally {
      setPendingId(null);
    }
  };

  const removeService = async (service: Service) => {
    if (!service.id) return;
    const confirmed = window.confirm(`Delete service "${service.title}"?`);
    if (!confirmed) return;
    setPendingId(service.id);
    setMessage(null);
    try {
      await onDelete(service.id);
      setMessage({ type: 'success', text: `Service "${service.title}" removed.` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete service' });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section className="bg-brand-surface rounded-xl border border-brand-border p-6 shadow-sm">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-brand-text-dark">Services</h2>
          <p className="text-sm text-brand-text-muted">Manage the offerings presented on your landing page.</p>
        </div>
      </header>

      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-2 text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {editableServices.map((service, index) => (
          <div key={service.id ?? index} className="rounded-lg border border-brand-border bg-brand-bg-light-alt p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-brand-text-dark">
                Title
                <input
                  value={service.title}
                  onChange={(event) => handleUpdateChange(index, 'title', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-brand-border bg-white/80 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
                />
              </label>
              <label className="text-sm font-medium text-brand-text-dark">
                Accent Color
                <select
                  value={service.color ?? 'green'}
                  onChange={(event) => handleUpdateChange(index, 'color', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-brand-border bg-white/80 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
                >
                  {serviceColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-brand-text-dark">
                Icon
                <select
                  value={service.iconKey ?? 'custom'}
                  onChange={(event) => handleUpdateChange(index, 'iconKey', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-brand-border bg-white/80 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
                >
                  {iconOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-brand-text-dark">
                Display Order
                <input
                  type="number"
                  value={service.displayOrder ?? ''}
                  onChange={(event) =>
                    handleUpdateChange(index, 'displayOrder', event.target.value === '' ? null : Number(event.target.value))
                  }
                  className="mt-1 w-full rounded-lg border border-brand-border bg-white/80 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
                />
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium text-brand-text-dark">
              Description
              <textarea
                value={service.description}
                onChange={(event) => handleUpdateChange(index, 'description', event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-brand-border bg-white/80 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none resize-none"
              />
            </label>
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => removeService(service)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                disabled={pendingId === service.id}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => saveService(service)}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-70"
                disabled={pendingId === service.id}
              >
                {pendingId === service.id ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-brand-primary bg-brand-primary/5 p-4">
        <h3 className="text-lg font-semibold text-brand-text-dark mb-4">Add New Service</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-brand-text-dark">
            Title
            <input
              value={newService.title}
              onChange={(event) => setNewService((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="text-sm font-medium text-brand-text-dark">
            Accent Color
            <select
              value={newService.color ?? 'green'}
              onChange={(event) => setNewService((prev) => ({ ...prev, color: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            >
              {serviceColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-brand-text-dark">
            Icon
            <select
              value={newService.iconKey ?? 'custom'}
              onChange={(event) => setNewService((prev) => ({ ...prev, iconKey: event.target.value as Service['iconKey'] }))}
              className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-brand-text-dark">
            Display Order
            <input
              type="number"
              value={newService.displayOrder ?? ''}
              onChange={(event) =>
                setNewService((prev) => ({
                  ...prev,
                  displayOrder: event.target.value === '' ? null : Number(event.target.value),
                }))
              }
              className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            />
          </label>
        </div>
        <label className="mt-4 block text-sm font-medium text-brand-text-dark">
          Description
          <textarea
            value={newService.description}
            onChange={(event) => setNewService((prev) => ({ ...prev, description: event.target.value }))}
            rows={3}
            className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none resize-none"
          />
        </label>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={createService}
            className="rounded-lg bg-brand-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-secondary/90 transition-colors disabled:opacity-70"
            disabled={pendingId === 'new'}
          >
            {pendingId === 'new' ? 'Creating...' : 'Create Service'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesManager;
