'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Card, Button, Input, Spinner } from '@examcraft/ui';
import { apiRequest } from '#api';
import { extractErrorMessage } from '../../../lib/error-utils';

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  head_user_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function DepartmentsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch departments
  const { data: departments, error: fetchError, isLoading } = useSWR<Department[]>(
    '/academic-structure/departments',
    async (url: string) => {
      const response = await apiRequest<{ departments: Department[] }>(url, { method: "GET" });
      return response.departments || response;
    }
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiRequest('/academic-structure/departments', { method: "POST", body: JSON.stringify(formData) });
      mutate('/academic-structure/departments');
      setFormData({ name: '', code: '', description: '' });
      setShowCreateForm(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setError(null);
    setLoading(true);

    try {
      await apiRequest(`/academic-structure/departments/${id}`, { method: "PUT", body: JSON.stringify(formData) });
      mutate('/academic-structure/departments');
      setEditingId(null);
      setFormData({ name: '', code: '', description: '' });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      await apiRequest(`/academic-structure/departments/${id}`, { method: "DELETE" });
      mutate('/academic-structure/departments');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const startEdit = (dept: Department) => {
    setEditingId(dept.id);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', code: '', description: '' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <Card padding="lg">
        <div className="text-red-400">Failed to load departments</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Departments</h1>
          <p className="text-zinc-400 mt-1">Manage academic departments</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="primary">
          {showCreateForm ? 'Cancel' : '+ New Department'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card padding="md" className="border border-red-500/50 bg-red-500/10">
          <div className="text-red-400 text-sm">{error}</div>
        </Card>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card padding="lg">
          <h2 className="text-xl font-semibold text-white mb-4">Create Department</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Department Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Computer Science"
              required
            />
            <Input
              label="Department Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., CS"
              required
            />
            <Input
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the department"
            />
            <div className="flex gap-3">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Create Department'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Departments List */}
      <Card padding="lg">
        <h2 className="text-xl font-semibold text-white mb-4">All Departments ({departments?.length || 0})</h2>
        
        {departments && departments.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <p>No departments found. Create your first department to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {departments?.map((dept: Department) => (
              <div
                key={dept.id}
                className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors"
              >
                {editingId === dept.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <Input
                      label="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                    />
                    <Input
                      label="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary" onClick={() => handleUpdate(dept.id)} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Save'}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{dept.name}</h3>
                        <span className="px-2 py-1 text-xs rounded bg-indigo-500/20 text-indigo-300 font-mono">
                          {dept.code}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${dept.is_active ? 'bg-green-500/20 text-green-300' : 'bg-zinc-500/20 text-zinc-400'}`}>
                          {dept.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {dept.description && (
                        <p className="text-sm text-zinc-400">{dept.description}</p>
                      )}
                      <p className="text-xs text-zinc-500 mt-2">
                        Created: {new Date(dept.created_at).toLocaleDateString('en-US')}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(dept)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(dept.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
