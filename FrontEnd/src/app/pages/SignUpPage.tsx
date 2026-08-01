import { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GlowButton } from '../components/GlowButton';
import { FloatingBlob } from '../components/FloatingBlob';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed.');
      login(data.token, data.user);
      navigate('/templates', { replace: true });
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FEFDFB] to-[#F5F0FF] flex items-center justify-center p-6 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingBlob color="linear-gradient(135deg, #C7B8EA 0%, #A7D7F0 100%)" size="400px" top="10%" right="10%" />
        <FloatingBlob color="linear-gradient(135deg, #FFB5A7 0%, #FFB8D1 100%)" size="350px" bottom="10%" left="10%" delay="delay-1000" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-4xl font-bold font-heading bg-gradient-to-r from-[#C7B8EA] via-[#FFB5A7] to-[#A7D7F0] bg-clip-text text-transparent mb-4">InviteStudio</Link>
          <p className="text-gray-600 mt-2">Create your account and start designing</p>
        </div>
        <GlassCard className="p-8">
          <h2 className="text-3xl font-bold font-heading text-gray-900 mb-6 text-center">Sign Up</h2>
          {error && <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none" /></div>
            <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none" /></div>
            <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none" /></div>
            <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none" /></div>
            <GlowButton type="submit" variant="primary" className="w-full">{loading ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Creating...</span> : 'Create Account'}</GlowButton>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">Already have an account? <Link to="/login" className="text-[#C7B8EA] font-medium">Login</Link></div>
        </GlassCard>
      </div>
    </div>
  );
}