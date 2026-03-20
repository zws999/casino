import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavbarAuth } from './components/NavbarAuth';
import { Hero } from './components/Hero';
import { Auth } from './components/Auth';
import { CoinflipMultiplayer } from './components/CoinflipMultiplayer';
import { BlackjackMultiplayer } from './components/BlackjackMultiplayer';
import { SlotsGame } from './components/SlotsGame';

function AppContent() {
  const [showAuth, setShowAuth] = useState(false);
  const [activeGame, setActiveGame] = useState<'coinflip' | 'blackjack' | 'slots' | null>(null);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #050713 0%, #0A0E27 50%, #050713 100%)',
      }}>
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 border-[#FFD58A] border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              boxShadow: '0 0 30px rgba(255, 213, 138, 0.3)',
            }}
          />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #050713 0%, #0A0E27 50%, #050713 100%)',
    }}>
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255, 213, 138, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 213, 138, 0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255, 181, 94, 0.3) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(138, 155, 255, 0.2) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Navigation */}
      <NavbarAuth onAuthClick={() => setShowAuth(true)} />

      {/* Hero Section */}
      {!activeGame && <Hero />}

      {/* Main Content */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 py-16">
        {!user ? (
          // Guest View
          <div className="text-center py-20">
            <div 
              className="inline-block px-6 py-3 rounded-full mb-6"
              style={{
                background: 'rgba(255, 213, 138, 0.1)',
                border: '2px solid rgba(255, 213, 138, 0.3)',
              }}
            >
              <span className="text-[#FFD58A] font-semibold">🔒 Authentication Required</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Join 303 Royale
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
              Create an account or login to start playing with real players in our premium casino
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="px-10 py-4 rounded-xl font-bold text-lg"
              style={{
                background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                color: '#0A0E27',
                boxShadow: '0 0 40px rgba(255, 213, 138, 0.5)',
              }}
            >
              Get Started - Free $10,000
            </button>
          </div>
        ) : (
          // Authenticated User View
          <>
            {/* Game Selection */}
            {!activeGame && (
              <div className="space-y-12">
                <div className="text-center mb-12">
                  <div 
                    className="inline-block px-6 py-2 rounded-full mb-4"
                    style={{
                      background: 'rgba(255, 213, 138, 0.1)',
                      border: '1px solid rgba(255, 213, 138, 0.3)',
                    }}
                  >
                    <span className="text-[#FFD58A] text-sm font-semibold tracking-wider">REAL MULTIPLAYER GAMES</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Choose Your Game
                  </h2>
                  <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
                    Play against real players. No bots, no fake wins. Pure skill and luck.
                  </p>
                </div>

                {/* Game Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  <GameCard
                    title="Coinflip Arena"
                    description="1v1 battles. Double or nothing against real players."
                    icon="🪙"
                    color="#FFD58A"
                    onClick={() => setActiveGame('coinflip')}
                  />
                  <GameCard
                    title="Multiplayer Blackjack"
                    description="Up to 4 players. Beat the dealer with your friends."
                    icon="🃏"
                    color="#3b82f6"
                    onClick={() => setActiveGame('blackjack')}
                  />
                  <GameCard
                    title="Premium Slots"
                    description="Single player. Spin for legendary wins."
                    icon="🎰"
                    color="#ec4899"
                    onClick={() => setActiveGame('slots')}
                  />
                </div>
              </div>
            )}

            {/* Active Game */}
            {activeGame === 'coinflip' && (
              <div>
                <button
                  onClick={() => setActiveGame(null)}
                  className="mb-6 px-4 py-2 rounded-lg text-white/70 hover:text-white transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  ← Back to Games
                </button>
                <CoinflipMultiplayer />
              </div>
            )}

            {activeGame === 'blackjack' && (
              <div>
                <button
                  onClick={() => setActiveGame(null)}
                  className="mb-6 px-4 py-2 rounded-lg text-white/70 hover:text-white transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  ← Back to Games
                </button>
                <BlackjackMultiplayer />
              </div>
            )}

            {activeGame === 'slots' && (
              <div>
                <button
                  onClick={() => setActiveGame(null)}
                  className="mb-6 px-4 py-2 rounded-lg text-white/70 hover:text-white transition-colors"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  ← Back to Games
                </button>
                <SlotsGame />
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-white/10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                  boxShadow: '0 0 30px rgba(255, 213, 138, 0.4)',
                }}
              >
                <span className="text-2xl">👑</span>
              </div>
              <h3 className="text-2xl font-bold text-white">303 Royale</h3>
            </div>
            <p className="text-white/50 mb-6 text-sm md:text-base">
              Real multiplayer casino. Real players. Real excitement.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-white/40">
              <a href="#" className="hover:text-[#FFD58A] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#FFD58A] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#FFD58A] transition-colors">Responsible Gaming</a>
              <a href="#" className="hover:text-[#FFD58A] transition-colors">Support</a>
            </div>
            <p className="text-white/30 text-xs mt-6">
              © 2026 303 Royale. All rights reserved. | Demo purposes only. Play responsibly. 18+
            </p>
          </div>
        </footer>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && !user && (
          <Auth onClose={() => setShowAuth(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function GameCard({ title, description, icon, color, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="p-6 md:p-8 rounded-3xl cursor-pointer group"
      style={{
        background: 'rgba(10, 14, 39, 0.6)',
        border: '2px solid rgba(255, 213, 138, 0.2)',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}80`;
        e.currentTarget.style.boxShadow = `0 0 40px ${color}40`;
        e.currentTarget.style.transform = 'translateY(-8px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 213, 138, 0.2)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="text-5xl md:text-6xl mb-4">{icon}</div>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/60 text-sm md:text-base mb-6">{description}</p>
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm"
        style={{
          background: `${color}20`,
          color: color,
          border: `1px solid ${color}40`,
        }}
      >
        Play Now →
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
