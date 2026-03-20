import { Crown, MessageCircle, User } from 'lucide-react';
import { motion } from 'motion/react';

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      style={{
        backdropFilter: 'blur(20px)',
        background: 'rgba(5, 7, 19, 0.7)',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Crown className="w-8 h-8 text-[#FFD58A]" style={{
              filter: 'drop-shadow(0 0 12px rgba(255, 213, 138, 0.5))',
            }} />
          </div>
          <div>
            <h1 className="text-xl tracking-tight text-white font-bold">303 Royale</h1>
            <p className="text-xs text-[#FFD58A]/60 tracking-wider">PREMIUM CASINO</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
            }}
          >
            <User className="w-4 h-4" />
            Account
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 font-medium transition-all relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
              color: '#0A0E27',
              boxShadow: '0 0 30px rgba(255, 213, 138, 0.4)',
            }}
          >
            <MessageCircle className="w-4 h-4" />
            Join Discord
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
