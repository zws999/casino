import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Mail, Lock, User, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthProps {
  onClose: () => void;
}

export function Auth({ onClose }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        await signup(email, password, username);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md rounded-3xl p-8 relative"
        style={{
          background: 'linear-gradient(180deg, rgba(10, 14, 39, 0.95) 0%, rgba(5, 7, 19, 0.95) 100%)',
          border: '2px solid rgba(255, 213, 138, 0.3)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{
            background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
            boxShadow: '0 0 30px rgba(255, 213, 138, 0.5)',
          }}>
            <Crown className="w-8 h-8 text-[#0A0E27]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join 303 Royale'}
          </h2>
          <p className="text-white/50 text-sm">
            {isLogin ? 'Login to continue playing' : 'Create your account to start'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-white/70 text-sm block mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:border-[#FFD58A]/50 outline-none transition-colors"
                  placeholder="Your username"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-white/70 text-sm block mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:border-[#FFD58A]/50 outline-none transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-white/70 text-sm block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:border-[#FFD58A]/50 outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-500/20 border border-red-500/50"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-lg"
            style={{
              background: loading 
                ? 'rgba(100, 100, 100, 0.5)' 
                : 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
              color: '#0A0E27',
              boxShadow: loading ? 'none' : '0 0 30px rgba(255, 213, 138, 0.4)',
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </motion.button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-white/70 hover:text-[#FFD58A] transition-colors text-sm"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="text-[#FFD58A] font-semibold">
              {isLogin ? 'Sign up' : 'Login'}
            </span>
          </button>
        </div>

        {!isLogin && (
          <div className="mt-6 p-4 rounded-xl bg-[#FFD58A]/10 border border-[#FFD58A]/20">
            <p className="text-[#FFD58A] text-xs text-center">
              🎁 New players receive <span className="font-bold">$10,000</span> starting balance!
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
