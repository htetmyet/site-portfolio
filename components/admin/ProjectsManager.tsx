import React, { useEffect, useState } from 'react';
import type { Project } from '../../types';

interface ProjectsManagerProps {
  projects: Project[];
  onCreate: (project: Project) => Promise<Project>;
  onUpdate: (id: number, project: Project) => Promise<Project>;
  onDelete: (id: number) => Promise<void>;
}

type EditableProject = Project & { tagsInput: string };

const buildEmptyProject = (): EditableProject => ({
  title: '',
  category: '',
  description: '',
  tags: [],
  tagsInput: '',
  imageUrl: '',
  displayOrder: null,
});

const withTagsInput = (project: Project): EditableProject => ({
  ...project,
  tags: project.tags ?? [],
  tagsInput: (project.tags ?? []).join(', '),
});

const sanitizeTags = (value: string) =>
  value
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

const buildProjectPayload = (project: EditableProject): Project => {
  const { tagsInput, ...rest } = project;
  return {
    ...rest,
    tags: sanitizeTags(tagsInput ?? ''),
  };
};

const ProjectsManager: React.FC<ProjectsManagerProps> = ({ projects, onCreate, onUpdate, onDelete }) => {
  const [editableProjects, setEditableProjects] = useState<EditableProject[]>(projects.map(withTagsInput));
  const [newProject, setNewProject] = useState<EditableProject>(buildEmptyProject());
  const [pendingId, setPendingId] = useState<number | 'new' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setEditableProjects(projects.map(withTagsInput));
  }, [projects]);

  const handleChange = (index: number, field: keyof Project, value: string | number | null) => {
    setEditableProjects((prev) =>
      prev.map((project, idx) => (idx === index ? { ...project, [field]: value } : project)),
    );
  };

  const handleTagsChange = (index: number, value: string) => {
    setEditableProjects((prev) =>
      prev.map((project, idx) =>
        idx === index
          ? {
              ...project,
              tagsInput: value,
              tags: sanitizeTags(value),
            }
          : project,
      ),
    );
  };

  const saveProject = async (project: EditableProject) => {
    if (!project.id) {
      return;
    }
    setPendingId(project.id);
    setMessage(null);
    try {
      await onUpdate(project.id, buildProjectPayload(project));
      setMessage({ type: 'success', text: `Project "${project.title}" updated.` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update project' });
    } finally {
      setPendingId(null);
    }
  };

  const createProject = async () => {
    if (!newProject.title || !newProject.category || !newProject.description) {
      setMessage({ type: 'error', text: 'Title, category, and description are required.' });
      return;
    }
    setPendingId('new');
    setMessage(null);
    try {
      await onCreate(buildProjectPayload(newProject));
      setNewProject(buildEmptyProject());
      setMessage({ type: 'success', text: 'Project created.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create project' });
    } finally {
      setPendingId(null);
    }
  };

  const removeProject = async (project: Project) => {
    if (!project.id) {
      return;
    }
    const confirmed = window.confirm(`Delete project "${project.title}"?`);
    if (!confirmed) {
      return;
    }
    setPendingId(project.id);
    setMessage(null);
    try {
      await onDelete(project.id);
      setMessage({ type: 'success', text: `Project "${project.title}" removed.` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete project' });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section className="bg-brand-surface rounded-xl border border-brand-border p-6 shadow-sm">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-brand-text-dark">Our Work</h2>
          <p className="text-sm text-brand-text-muted">Showcase the case studies that appear in the landing page portfolio grid.</p>
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
        {editableProjects.map((project, index) => (
          <div key={project.id ?? index} className="rounded-lg border border-brand-border bg-brand-bg-light-alt p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-brand-text-dark">
                Title
                <input
                  value={project.title}
                  onChange={(event) => handleChange(index, 'title', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-brand-border bg-white/80 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
                />
              </label>
              <label className="text-sm font-medium text-brand-text-dark">
                Category
                <input
                  value={project.category}
                  onChange={(event) => handleChange(index, 'category', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-brand-border bg-white/80 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
                />
              </label>
              <label className="text-sm font-medium text-brand-text-dark">
                Image URL
                <input
                  value={project.imageUrl || ''}
                  onChange={(event) => handleChange(index, 'imageUrl', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-brand-border bg-white/80 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
                  placeholder="https://..."
                />
              </label>
              <label className="text-sm font-medium text-brand-text-dark">
                Display Order
                <input
                  type="number"
                  value={project.displayOrder ?? ''}
                  onChange={(event) =>
                    handleChange(index, 'displayOrder', event.target.value === '' ? null : Number(event.target.value))
                  }
                  className="mt-1 w-full rounded-lg border border-brand-border bg-white/80 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium text-brand-text-dark">
              Tags (comma separated)
              <input
                value={project.tagsInput}
                onChange={(event) => handleTagsChange(index, event.target.value)}
                className="mt-1 w-full rounded-lg border border-brand-border bg-white/80 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-brand-text-dark">
              Description
              <textarea
                value={project.description}
                onChange={(event) => handleChange(index, 'description', event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-brand-border bg-white/80 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none resize-none"
              />
            </label>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => removeProject(project)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                disabled={pendingId === project.id}
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => saveProject(project)}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-70"
                disabled={pendingId === project.id}
              >
                {pendingId === project.id ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-brand-primary bg-brand-primary/5 p-4">
        <h3 className="text-lg font-semibold text-brand-text-dark mb-4">Add New Project</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-brand-text-dark">
            Title
            <input
              value={newProject.title}
              onChange={(event) => setNewProject((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="text-sm font-medium text-brand-text-dark">
            Category
            <input
              value={newProject.category}
              onChange={(event) => setNewProject((prev) => ({ ...prev, category: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            />
          </label>
          <label className="text-sm font-medium text-brand-text-dark">
            Image URL
            <input
              value={newProject.imageUrl || ''}
              onChange={(event) => setNewProject((prev) => ({ ...prev, imageUrl: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
              placeholder="https://..."
            />
          </label>
          <label className="text-sm font-medium text-brand-text-dark">
            Display Order
            <input
              type="number"
              value={newProject.displayOrder ?? ''}
              onChange={(event) =>
                setNewProject((prev) => ({
                  ...prev,
                  displayOrder: event.target.value === '' ? null : Number(event.target.value),
                }))
              }
              className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-medium text-brand-text-dark">
          Tags (comma separated)
          <input
            value={newProject.tagsInput}
            onChange={(event) =>
              setNewProject((prev) => ({
                ...prev,
                tagsInput: event.target.value,
                tags: sanitizeTags(event.target.value),
              }))
            }
            className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-brand-text-dark">
          Description
          <textarea
            value={newProject.description}
            onChange={(event) => setNewProject((prev) => ({ ...prev, description: event.target.value }))}
            rows={3}
            className="mt-1 w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none resize-none"
          />
        </label>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={createProject}
            className="rounded-lg bg-brand-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-secondary/90 transition-colors disabled:opacity-70"
            disabled={pendingId === 'new'}
          >
            {pendingId === 'new' ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsManager;
