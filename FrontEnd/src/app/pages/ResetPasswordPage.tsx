import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GlowButton } from '../components/GlowButton';
import { FloatingBlob } from '../components/FloatingBlob';

export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('This reset link is invalid.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to reset password.');
      }

      setSuccess('Password updated. Redirecting to login...');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FEFDFB] to-[#F5F0FF] flex items-center justify-center p-6 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingBlob color="linear-gradient(135deg, #FFB5A7 0%, #FFB8D1 100%)" size="380px" top="10%" right="8%" />
        <FloatingBlob color="linear-gradient(135deg, #C7B8EA 0%, #A7D7F0 100%)" size="320px" bottom="10%" left="8%" delay="delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-4xl font-bold font-heading bg-gradient-to-r from-[#C7B8EA] via-[#FFB5A7] to-[#A7D7F0] bg-clip-text text-transparent mb-4">
            InviteStudio
          </Link>
          <p className="text-gray-600 mt-2">Create a new password and return to your workspace.</p>
        </div>

        <GlassCard className="p-8">
          <h1 className="text-3xl font-bold font-heading text-gray-900 text-center mb-3">Reset Password</h1>
          <p className="text-sm text-gray-600 text-center mb-6">Choose a new password for your account.</p>

          {error && <div className="p-4 mb-6 text-sm text-red-600 bg-red-50/80 border border-red-200/50 rounded-2xl">{error}</div>}
          {success && (
            <div className="p-4 mb-6 text-sm text-green-700 bg-green-50/80 border border-green-200/50 rounded-2xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:border-[#C7B8EA] focus:ring-2 focus:ring-[#C7B8EA]/20 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:border-[#C7B8EA] focus:ring-2 focus:ring-[#C7B8EA]/20 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <GlowButton type="submit" variant="primary" className="w-full" disabled={loading || !token}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating password...
                </span>
              ) : (
                'Update password'
              )}
            </GlowButton>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[#C7B8EA] hover:text-[#B8A8DA] transition-colors font-medium">
              Back to login
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}