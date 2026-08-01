import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { BarChart3, FileText, LayoutDashboard, Paintbrush, Settings, Trash2, Users } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const categories = ['Wedding', 'Engagement', 'Reception', 'Baby Shower'];
const statuses = ['draft', 'published'];

type Template = {
  _id: string;
  title: string;
  category: string;
  thumbnail: string;
  description: string;
  editorData?: unknown;
  isPremium: boolean;
  status: 'draft' | 'published';
  createdAt: string;
};

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
};

type Stats = {
  totalTemplates: number;
  publishedTemplates: number;
  draftTemplates: number;
  totalUsers: number;
};

const describeThumbnail = (thumbnail: string) => ({
  field: 'thumbnail',
  present: Boolean(thumbnail),
  length: thumbnail?.length ?? 0,
  preview: thumbnail ? `${thumbnail.slice(0, 80)}${thumbnail.length > 80 ? '...' : ''}` : '',
});

const emptyForm = {
  title: '',
  description: '',
  category: 'Wedding',
  thumbnail: '',
  isPremium: false,
  status: 'draft' as 'draft' | 'published',
};

export function AdminDashboardPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('Dashboard');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats>({ totalTemplates: 0, publishedTemplates: 0, draftTemplates: 0, totalUsers: 0 });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadAdminData = async () => {
    if (!token) return;

    const [templatesResponse, statsResponse, usersResponse] = await Promise.all([
      fetch(`${API_URL}/admin/templates`, { headers }),
      fetch(`${API_URL}/admin/stats`, { headers }),
      fetch(`${API_URL}/admin/users`, { headers }),
    ]);

    const templatesData = await templatesResponse.json();
    const statsData = await statsResponse.json();
    const usersData = await usersResponse.json();

    if (!templatesResponse.ok) throw new Error(templatesData.message || 'Failed to load templates.');
    if (!statsResponse.ok) throw new Error(statsData.message || 'Failed to load stats.');
    if (!usersResponse.ok) throw new Error(usersData.message || 'Failed to load users.');

    const nextTemplates = templatesData.templates || [];
    nextTemplates.forEach((template: Template) => {
      console.log('[Template Thumbnail] GET /api/admin/templates frontend received', {
        templateId: template._id,
        ...describeThumbnail(template.thumbnail),
        duplicateFieldsPresent: {
          thumbnailImage: Object.prototype.hasOwnProperty.call(template, 'thumbnailImage'),
          cover: Object.prototype.hasOwnProperty.call(template, 'cover'),
          imageUrl: Object.prototype.hasOwnProperty.call(template, 'imageUrl'),
        },
      });
    });

    setTemplates(nextTemplates);
    setStats(statsData);
    setUsers(usersData.users || []);
  };

  useEffect(() => {
    loadAdminData().catch((err) => setError(err.message || 'Failed to load admin data.'));
  }, [token]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setActiveView('Metadata');
  };

  const editMetadata = (template: Template) => {
    setEditingId(template._id);
    setForm({
      title: template.title,
      description: template.description || '',
      category: template.category,
      thumbnail: template.thumbnail,
      isPremium: template.isPremium,
      status: template.status,
    });
    setActiveView('Metadata');
  };

  const saveMetadata = async () => {
    setError('');
    setMessage('');

    try {
      console.log('[Template Thumbnail] admin metadata saving', {
        templateId: editingId,
        ...describeThumbnail(form.thumbnail),
      });
      const response = await fetch(`${API_URL}/admin/templates${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save template metadata.');

      await loadAdminData();

      if (!editingId) {
        const editorRoute = `/admin/templates/${data.template._id}/editor`;
        console.log(`Opening admin template editor route: ${editorRoute}`);
        navigate(editorRoute);
        return;
      }

      setMessage('Template metadata updated.');
      setActiveView('Templates');
    } catch (err: any) {
      setError(err.message || 'Failed to save template metadata.');
    }
  };

  const updateStatus = async (template: Template, status: 'draft' | 'published') => {
    const response = await fetch(`${API_URL}/admin/templates/${template._id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update status.');
    await loadAdminData();
  };

  const deleteTemplate = async (template: Template) => {
    if (!window.confirm(`Delete ${template.title}?`)) return;

    const response = await fetch(`${API_URL}/admin/templates/${template._id}`, { method: 'DELETE', headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete template.');
    await loadAdminData();
  };

  const handleThumbnailUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, thumbnail: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const openTemplateEditor = (template: Template) => {
    const editorRoute = `/admin/templates/${template._id}/editor`;
    console.log(`Opening admin template editor route: ${editorRoute}`);
    navigate(editorRoute);
  };

  const menu = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Templates', icon: FileText },
    { label: 'Users', icon: Users },
    { label: 'Analytics', icon: BarChart3 },
    { label: 'Settings', icon: Settings },
  ];

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        ['Total Templates', stats.totalTemplates],
        ['Published Templates', stats.publishedTemplates],
        ['Draft Templates', stats.draftTemplates],
        ['Total Users', stats.totalUsers],
      ].map(([label, value]) => (
        <GlassCard key={label} className="p-5">
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{value}</div>
        </GlassCard>
      ))}
    </div>
  );

  const renderTemplates = () => (
    <GlassCard className="p-5 overflow-x-auto">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 font-heading">Templates</h2>
        <button onClick={openCreateForm} className="px-4 py-2 rounded-xl bg-[#C7B8EA] text-white font-semibold">Create Template</button>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="text-gray-500 border-b border-gray-200">
          <tr>
            <th className="py-3">Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Premium</th>
            <th>Design</th>
            <th>Created Date</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template._id} className="border-b border-gray-100">
              <td className="py-3 font-medium text-gray-900">{template.title}</td>
              <td>{template.category}</td>
              <td className="capitalize">{template.status}</td>
              <td>{template.isPremium ? 'Premium' : 'Free'}</td>
              <td>{template.editorData ? 'Saved' : 'Not built'}</td>
              <td>{new Date(template.createdAt).toLocaleDateString()}</td>
              <td className="py-3">
                <div className="flex justify-end gap-2">
                  <button onClick={() => openTemplateEditor(template)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200">
                    <Paintbrush className="w-3.5 h-3.5" /> Open Editor
                  </button>
                  <button onClick={() => editMetadata(template)} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200">Edit</button>
                  <button onClick={() => updateStatus(template, template.status === 'published' ? 'draft' : 'published').catch((err) => setError(err.message))} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200">
                    {template.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => deleteTemplate(template).catch((err) => setError(err.message))} className="p-2 rounded-lg bg-red-50 text-red-600" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );

  const renderUsers = () => (
    <GlassCard className="p-5 overflow-x-auto">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Users</h2>
          <p className="text-sm text-gray-500 mt-1">All users stored in MongoDB, newest first.</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-[#C7B8EA]/20 text-gray-700 font-semibold">
          {users.length} total
        </div>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="text-gray-500 border-b border-gray-200">
          <tr>
            <th className="py-3">Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-500">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id} className="border-b border-gray-100">
                <td className="py-3 font-medium text-gray-900">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-[#C7B8EA]/20 text-gray-800' : 'bg-gray-100 text-gray-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </GlassCard>
  );

  const renderMetadataForm = () => (
    <GlassCard className="p-5 max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 font-heading mb-5">{editingId ? 'Edit Template Metadata' : 'Create Template Metadata'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="px-4 py-3 rounded-xl border border-gray-200" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200">
          {categories.map((category) => <option key={category}>{category}</option>)}
        </select>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="md:col-span-2 px-4 py-3 rounded-xl border border-gray-200 min-h-24" />
        <input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="Thumbnail URL or uploaded data" className="px-4 py-3 rounded-xl border border-gray-200" />
        <input type="file" accept="image/*" onChange={(e) => handleThumbnailUpload(e.target.files?.[0])} className="px-4 py-3 rounded-xl border border-gray-200 bg-white" />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })} className="px-4 py-3 rounded-xl border border-gray-200">
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
        <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white">
          <input type="checkbox" checked={form.isPremium} onChange={(e) => setForm({ ...form, isPremium: e.target.checked })} />
          Premium template
        </label>
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={saveMetadata} className="px-5 py-2.5 rounded-xl bg-[#C7B8EA] text-white font-semibold">
          {editingId ? 'Save Metadata' : 'Create Template'}
        </button>
        <button onClick={() => setActiveView('Templates')} className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700">Cancel</button>
      </div>
    </GlassCard>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FEFDFB] to-[#F5F0FF]">
      <Navbar />
      <div className="pt-28 px-6 pb-12 max-w-7xl mx-auto flex gap-6">
        <aside className="w-64 shrink-0 rounded-2xl bg-white/70 border border-white/70 p-3 h-fit">
          {menu.map((item) => (
            <button key={item.label} onClick={() => setActiveView(item.label)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${activeView === item.label ? 'bg-[#C7B8EA]/20 text-gray-900' : 'text-gray-600 hover:bg-white'}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </aside>
        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-4xl font-bold font-heading text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-1">Create metadata first, then build and publish the actual invitation design in the editor.</p>
          </div>
          {message && <div className="mb-4 text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3">{message}</div>}
          {error && <div className="mb-4 text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}
          {activeView === 'Dashboard' && renderDashboard()}
          {activeView === 'Templates' && renderTemplates()}
          {activeView === 'Users' && renderUsers()}
          {activeView === 'Metadata' && renderMetadataForm()}
          {['Analytics', 'Settings'].includes(activeView) && <GlassCard className="p-8 text-gray-600">{activeView} management is ready for the next phase.</GlassCard>}
        </main>
      </div>
    </div>
  );
}
