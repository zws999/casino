import { Crown, LogOut, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function NavbarAuth({ onAuthClick }: { onAuthClick: () => void }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      style={{
        backdropFilter: 'blur(20px)',
        background: 'rgba(5, 7, 19, 0.85)',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative">
            <Crown className="w-6 h-6 md:w-8 md:h-8 text-[#FFD58A]" style={{
              filter: 'drop-shadow(0 0 12px rgba(255, 213, 138, 0.5))',
            }} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl tracking-tight text-white font-bold">303 Royale</h1>
            <p className="text-[10px] md:text-xs text-[#FFD58A]/60 tracking-wider hidden sm:block">PREMIUM CASINO</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <>
              {/* Balance - Mobile */}
              <div className="block md:hidden">
                <div className="text-[#FFD58A] text-sm font-bold">
                  ${(user.balance / 1000).toFixed(1)}K
                </div>
              </div>

              {/* Balance - Desktop */}
              <div 
                className="hidden md:block px-4 py-2 rounded-lg"
                style={{
                  background: 'rgba(255, 213, 138, 0.1)',
                  border: '1px solid rgba(255, 213, 138, 0.3)',
                }}
              >
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#FFD58A]" />
                  <span className="text-[#FFD58A] font-bold">${user.balance.toLocaleString()}</span>
                </div>
              </div>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base"
                  style={{
                    background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                    color: '#0A0E27',
                    boxShadow: '0 0 20px rgba(255, 213, 138, 0.4)',
                  }}
                >
                  {user.username.substring(0, 2).toUpperCase()}
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-12 md:top-14 w-48 md:w-64 rounded-2xl overflow-hidden"
                      style={{
                        background: 'rgba(10, 14, 39, 0.95)',
                        border: '2px solid rgba(255, 213, 138, 0.3)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
                      }}
                    >
                      <div className="p-4 border-b border-white/10">
                        <div className="text-white font-bold mb-1">{user.username}</div>
                        <div className="text-white/50 text-xs md:text-sm truncate">{user.email}</div>
                      </div>
                      
                      <div className="p-3 md:p-4">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="p-2 md:p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                            <div className="text-white/50 text-[10px] md:text-xs mb-1">Wins</div>
                            <div className="text-white font-bold text-sm md:text-base">{user.stats.totalWins}</div>
                          </div>
                          <div className="p-2 md:p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                            <div className="text-white/50 text-[10px] md:text-xs mb-1">Games</div>
                            <div className="text-white font-bold text-sm md:text-base">{user.stats.gamesPlayed}</div>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            logout();
                            setShowMenu(false);
                          }}
                          className="w-full py-2 md:py-3 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAuthClick}
              className="px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-bold"
              style={{
                background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                color: '#0A0E27',
                boxShadow: '0 0 30px rgba(255, 213, 138, 0.4)',
              }}
            >
              Login
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
