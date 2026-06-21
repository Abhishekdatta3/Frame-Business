import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Frame } from 'lucide-react';

// Username to email mapping — update emails to match what you registered in Supabase
const USER_CREDENTIALS: Record<string, { email: string; role: string }> = {
  owner1: { email: 'owner1@saiframe.local', role: 'owner' },
  worker1: { email: 'worker1@saiframe.local', role: 'worker' },
};

export default function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const trimmedUsername = username.trim().toLowerCase();
      const credentials = USER_CREDENTIALS[trimmedUsername];

      if (!credentials) {
        setError('Invalid username or password.');
        setLoading(false);
        return;
      }

      // Supabase enforces min 6 chars; map short passwords to their padded form
      const actualPassword = password === '123' ? '123456' : password;
      const { error } = await signIn(credentials.email, actualPassword);

      if (error) {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-amber-500 p-4 rounded-full mb-4 shadow-lg">
              <Frame className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Frame Business</h1>
            <p className="text-slate-400 mt-2">Order Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-slate-500 text-xs">
            Contact the owner to get access.
          </div>
        </div>
      </div>
    </div>
  );
}
