import { motion } from 'motion/react';
import { useState } from 'react';

export function BlackjackTable() {
  const [balance] = useState(12450);
  const [bet, setBet] = useState(100);

  const chipValues = [10, 25, 50, 100, 250, 500];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Blackjack</h2>
        <p className="text-white/50">Beat the dealer. Classic casino experience.</p>
      </div>

      {/* Table Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(10, 14, 39, 0.6)',
          border: '1px solid rgba(255, 213, 138, 0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Casino Table Felt */}
        <div 
          className="relative p-8 md:p-12 rounded-3xl"
          style={{
            background: 'radial-gradient(ellipse at center, #1a5e3f 0%, #0d3424 100%)',
            boxShadow: 'inset 0 0 80px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Table Markings */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-4 border-yellow-500 rounded-full" />
          </div>

          {/* Dealer Area */}
          <div className="mb-16">
            <div className="text-center mb-6">
              <div className="inline-block px-6 py-2 rounded-full bg-black/30 border border-yellow-500/30">
                <span className="text-yellow-500/70 text-sm font-semibold tracking-wider">DEALER</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-3">
              <Card value="A" suit="♠" />
              <Card value="K" suit="♥" faceDown />
            </div>
          </div>

          {/* Player Area */}
          <div className="mb-8">
            <div className="flex justify-center gap-3 mb-6">
              <Card value="J" suit="♦" />
              <Card value="9" suit="♣" />
            </div>
            
            <div className="text-center">
              <div className="inline-block px-6 py-2 rounded-full bg-black/30 border border-yellow-500/30">
                <span className="text-yellow-500 text-xl font-bold">20</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <GameButton>Hit</GameButton>
            <GameButton variant="gold">Stand</GameButton>
            <GameButton>Double</GameButton>
            <GameButton variant="dark">Split</GameButton>
          </div>

          {/* Betting Area */}
          <div 
            className="p-6 rounded-2xl"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 213, 138, 0.2)',
            }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Chips */}
              <div className="flex gap-2 flex-wrap justify-center">
                {chipValues.map((value) => (
                  <Chip 
                    key={value} 
                    value={value} 
                    active={bet === value}
                    onClick={() => setBet(value)}
                  />
                ))}
              </div>

              {/* Bet Display */}
              <div className="text-center">
                <div className="text-white/50 text-sm mb-1">Current Bet</div>
                <div className="text-[#FFD58A] text-2xl font-bold">${bet}</div>
              </div>

              {/* Balance */}
              <div className="text-center">
                <div className="text-white/50 text-sm mb-1">Balance</div>
                <div className="text-white text-2xl font-bold">${balance.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Card({ value, suit, faceDown }: { value?: string; suit?: string; faceDown?: boolean }) {
  const isRed = suit === '♥' || suit === '♦';
  
  if (faceDown) {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        className="w-20 h-28 rounded-lg flex items-center justify-center relative"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          border: '2px solid rgba(255, 213, 138, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="absolute inset-2 border-2 border-white/10 rounded" />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="w-20 h-28 rounded-lg p-2 flex flex-col justify-between relative bg-white"
      style={{
        border: '2px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className={`${isRed ? 'text-red-600' : 'text-black'} font-bold text-lg`}>
        {value}
        <div className="text-2xl leading-none">{suit}</div>
      </div>
      <div className={`${isRed ? 'text-red-600' : 'text-black'} font-bold text-lg text-right transform rotate-180`}>
        {value}
        <div className="text-2xl leading-none">{suit}</div>
      </div>
    </motion.div>
  );
}

function Chip({ value, active, onClick }: { value: number; active: boolean; onClick: () => void }) {
  const colors = {
    10: { border: '#dc2626', glow: '#ef4444' },
    25: { border: '#16a34a', glow: '#22c55e' },
    50: { border: '#2563eb', glow: '#3b82f6' },
    100: { border: '#000000', glow: '#404040' },
    250: { border: '#7c3aed', glow: '#8b5cf6' },
    500: { border: '#FFB95E', glow: '#FFD58A' },
  };

  const color = colors[value as keyof typeof colors];

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="w-14 h-14 rounded-full font-bold text-white relative"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${color.glow}, ${color.border})`,
        border: `3px solid ${active ? '#FFD58A' : color.border}`,
        boxShadow: active 
          ? `0 0 20px ${color.glow}, 0 0 40px rgba(255, 213, 138, 0.5)` 
          : `0 4px 12px rgba(0, 0, 0, 0.5)`,
      }}
    >
      <div className="text-sm">${value}</div>
    </motion.button>
  );
}

function GameButton({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'gold' | 'dark' }) {
  const styles = {
    default: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      color: 'white',
    },
    gold: {
      background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
      border: '2px solid rgba(255, 213, 138, 0.5)',
      color: '#0A0E27',
      boxShadow: '0 0 20px rgba(255, 213, 138, 0.4)',
    },
    dark: {
      background: 'rgba(0, 0, 0, 0.5)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
    },
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-8 py-3 rounded-xl font-semibold min-w-[120px]"
      style={styles[variant]}
    >
      {children}
    </motion.button>
  );
}
