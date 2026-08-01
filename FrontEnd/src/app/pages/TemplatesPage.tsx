import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { GlassCard } from '../components/GlassCard';
import { GlowButton } from '../components/GlowButton';
import { FloatingBlob } from '../components/FloatingBlob';
import { Search, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';
const categories = ['All', 'Wedding', 'Engagement', 'Baby Shower', 'Reception'];

type Template = {
  _id: string;
  title: string;
  category: string;
  thumbnail: string;
  description?: string;
  isPremium: boolean;
};

const describeThumbnail = (thumbnail: string) => ({
  field: 'thumbnail',
  present: Boolean(thumbnail),
  length: thumbnail?.length ?? 0,
  preview: thumbnail ? `${thumbnail.slice(0, 80)}${thumbnail.length > 80 ? '...' : ''}` : '',
});

export function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const params = selectedCategory === 'All' ? '' : `?category=${encodeURIComponent(selectedCategory)}`;

    setLoading(true);
    setError('');

    const loadTemplates = async () => {
      try {
        const response = await fetch(`${API_URL}/templates${params}`, { signal: controller.signal });
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) throw new Error(data.message || 'Failed to load templates.');
        const nextTemplates = Array.isArray(data.templates) ? data.templates : [];
        nextTemplates.forEach((template: Template) => {
          console.log('[Template Thumbnail] GET /api/templates frontend received', {
            templateId: template._id,
            ...describeThumbnail(template.thumbnail),
            duplicateFieldsPresent: {
              thumbnailImage: Object.prototype.hasOwnProperty.call(template, 'thumbnailImage'),
              cover: Object.prototype.hasOwnProperty.call(template, 'cover'),
              imageUrl: Object.prototype.hasOwnProperty.call(template, 'imageUrl'),
            },
          });
        });
        if (!cancelled) setTemplates(nextTemplates);
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;

        setTemplates([]);
        setError(err instanceof Error ? err.message : 'Failed to load templates.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadTemplates();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedCategory]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => template.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [templates, searchQuery]);

  const handleCustomize = (templateId: string) => {
    if (!token) {
      navigate('/login', { state: { from: { pathname: `/editor/${templateId}` } } });
      return;
    }

    navigate(`/editor/${templateId}`);
  };

  const getTemplateThumbnailForRender = (template: Template) => {
    console.log('[Template Thumbnail] template card rendering', {
      templateId: template._id,
      ...describeThumbnail(template.thumbnail),
    });
    return template.thumbnail;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FEFDFB] to-[#F5F0FF] overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingBlob color="linear-gradient(135deg, #FFB5A7 0%, #FFB8D1 100%)" size="400px" top="10%" left="5%" />
        <FloatingBlob color="linear-gradient(135deg, #C7B8EA 0%, #A7D7F0 100%)" size="350px" bottom="10%" right="10%" delay="delay-1000" />
        <FloatingBlob color="linear-gradient(135deg, #FFF4B8 0%, #A7D7F0 100%)" size="300px" top="50%" right="5%" delay="delay-2000" />
      </div>

      <Navbar />

      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold font-heading text-gray-900 mb-4">Browse Templates</h1>
            <p className="text-xl text-gray-600">Choose from our collection of published invitation templates</p>
          </div>

          <div className="mb-8 max-w-2xl mx-auto">
            <GlassCard className="p-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border-none rounded-2xl focus:bg-white outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </GlassCard>
          </div>

          <div className="mb-12">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all font-heading ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#C7B8EA] to-[#A7D7F0] text-white shadow-[0_4px_20px_rgba(199,184,234,0.3)]'
                      : 'bg-white/50 border border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mb-6 text-center text-red-600">{error}</div>}
          {loading && <div className="text-center text-gray-500 py-10">Loading templates...</div>}

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <GlassCard key={template._id} hover className="p-6 group">
                  <div className="w-full aspect-[3/4] rounded-2xl bg-white/70 mb-4 relative overflow-hidden border border-white/60">
                    <img src={getTemplateThumbnailForRender(template)} alt={template.title} className="w-full h-full object-cover" />
                    {template.isPremium && (
                      <span className="absolute top-3 right-3 rounded-full bg-[#2D2D2D] text-white text-xs px-3 py-1 font-semibold">Premium</span>
                    )}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <GlowButton onClick={() => handleCustomize(template._id)} variant="primary" size="sm">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Customize
                      </GlowButton>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-heading text-gray-900 mb-1">{template.title}</h3>
                  <p className="text-gray-600 text-sm">{template.category}</p>
                </GlassCard>
              ))}
            </div>
          )}

          {!loading && filteredTemplates.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-400 font-heading">No templates found</p>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
