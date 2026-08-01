import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlowButton } from '../components/GlowButton';
import { FloatingBlob } from '../components/FloatingBlob';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to request a reset link.');
      }

      setSuccess('If an account exists, a reset link has been sent to that inbox.');
    } catch (err: any) {
      setError(err.message || 'Unable to request a reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FEFDFB] to-[#F5F0FF] flex items-center justify-center p-6 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingBlob color="linear-gradient(135deg, #C7B8EA 0%, #A7D7F0 100%)" size="380px" top="12%" left="8%" />
        <FloatingBlob color="linear-gradient(135deg, #FFB5A7 0%, #FFB8D1 100%)" size="320px" bottom="8%" right="10%" delay="delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-4xl font-bold font-heading bg-gradient-to-r from-[#C7B8EA] via-[#FFB5A7] to-[#A7D7F0] bg-clip-text text-transparent mb-4">
            InviteStudio
          </Link>
          <p className="text-gray-600 mt-2">We’ll send a reset link to your inbox.</p>
        </div>

        <GlassCard className="p-8">
          <h1 className="text-3xl font-bold font-heading text-gray-900 text-center mb-3">Forgot Password</h1>
          <p className="text-sm text-gray-600 text-center mb-6">Enter your email and we’ll help you get back in.</p>

          {error && <div className="p-4 mb-6 text-sm text-red-600 bg-red-50/80 border border-red-200/50 rounded-2xl">{error}</div>}
          {success && (
            <div className="p-4 mb-6 text-sm text-green-700 bg-green-50/80 border border-green-200/50 rounded-2xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:border-[#C7B8EA] focus:ring-2 focus:ring-[#C7B8EA]/20 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <GlowButton type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending link...
                </span>
              ) : (
                'Send reset link'
              )}
            </GlowButton>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[#C7B8EA] hover:text-[#B8A8DA] transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}