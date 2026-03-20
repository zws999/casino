import { motion } from 'motion/react';
import { useState } from 'react';
import { Cherry, Diamond, Crown, Star, Gem, Sparkles } from 'lucide-react';

const symbols = [
  { icon: Cherry, color: '#ef4444', name: 'Cherry' },
  { icon: Diamond, color: '#3b82f6', name: 'Diamond' },
  { icon: Crown, color: '#FFD58A', name: 'Crown' },
  { icon: Star, color: '#eab308', name: 'Star' },
  { icon: Gem, color: '#8b5cf6', name: 'Gem' },
  { icon: Sparkles, color: '#ec4899', name: 'Sparkles' },
];

export function SlotsGame() {
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState([2, 2, 2]); // Start with Crown (index 2)
  const [balance] = useState(12450);
  const [bet] = useState(50);
  const [lastWin, setLastWin] = useState(0);

  const spin = () => {
    if (spinning) return;
    
    setSpinning(true);
    setLastWin(0);

    // Simulate spin
    const interval = setInterval(() => {
      setReels([
        Math.floor(Math.random() * symbols.length),
        Math.floor(Math.random() * symbols.length),
        Math.floor(Math.random() * symbols.length),
      ]);
    }, 100);

    // Stop after 2 seconds
    setTimeout(() => {
      clearInterval(interval);
      const finalReels = [
        Math.floor(Math.random() * symbols.length),
        Math.floor(Math.random() * symbols.length),
        Math.floor(Math.random() * symbols.length),
      ];
      setReels(finalReels);
      
      // Check for win
      if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
        setLastWin(bet * 10);
      }
      
      setSpinning(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Premium Slots</h2>
        <p className="text-white/50">Spin for legendary wins. Maximum luxury.</p>
      </div>

      {/* Slots Machine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Machine Body */}
        <div 
          className="rounded-3xl p-8 md:p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(10, 14, 39, 0.9) 0%, rgba(5, 7, 19, 0.9) 100%)',
            border: '2px solid rgba(255, 213, 138, 0.3)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6), inset 0 0 60px rgba(255, 213, 138, 0.05)',
          }}
        >
          {/* Decorative Top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[#FFD58A] to-transparent opacity-50" />
          
          {/* Reels Container */}
          <div 
            className="mb-8 p-6 rounded-2xl"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '2px solid rgba(255, 213, 138, 0.2)',
              boxShadow: 'inset 0 4px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              {reels.map((symbolIndex, reelIndex) => (
                <Reel key={reelIndex} symbol={symbols[symbolIndex]} spinning={spinning} />
              ))}
            </div>
          </div>

          {/* Win Display */}
          {lastWin > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <div 
                className="px-12 py-6 rounded-2xl text-center"
                style={{
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: '3px solid #FFD58A',
                  boxShadow: '0 0 60px rgba(255, 213, 138, 0.8)',
                }}
              >
                <div className="text-[#FFD58A] text-sm font-semibold mb-2">BIG WIN!</div>
                <div className="text-white text-4xl font-bold">${lastWin}</div>
              </div>
            </motion.div>
          )}

          {/* Info Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-white/50 text-sm mb-1">Bet Amount</div>
              <div className="text-[#FFD58A] text-xl font-bold">${bet}</div>
            </div>
            
            <div className="text-center">
              <div className="text-white/50 text-sm mb-1">Balance</div>
              <div className="text-white text-xl font-bold">${balance.toLocaleString()}</div>
            </div>

            <div className="text-center">
              <div className="text-white/50 text-sm mb-1">Last Win</div>
              <div className="text-[#FFD58A] text-xl font-bold">${lastWin}</div>
            </div>
          </div>

          {/* Spin Button */}
          <motion.button
            whileHover={{ scale: spinning ? 1 : 1.05 }}
            whileTap={{ scale: spinning ? 1 : 0.95 }}
            onClick={spin}
            disabled={spinning}
            className="w-full py-6 rounded-2xl font-bold text-xl relative overflow-hidden"
            style={{
              background: spinning 
                ? 'rgba(100, 100, 100, 0.5)' 
                : 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
              color: '#0A0E27',
              boxShadow: spinning 
                ? 'none' 
                : '0 0 40px rgba(255, 213, 138, 0.6)',
              cursor: spinning ? 'not-allowed' : 'pointer',
            }}
          >
            {spinning ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                SPINNING...
              </motion.span>
            ) : (
              'SPIN TO WIN'
            )}
          </motion.button>

          {/* Paytable */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
            {symbols.map((symbol, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <symbol.icon className="w-6 h-6 mx-auto mb-1" style={{ color: symbol.color }} />
                <div className="text-white/70 text-xs">x3 = {bet * 10}x</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Reel({ symbol, spinning }: { symbol: typeof symbols[0]; spinning: boolean }) {
  return (
    <motion.div
      animate={spinning ? {
        y: [0, -20, 0],
      } : {}}
      transition={spinning ? {
        duration: 0.1,
        repeat: Infinity,
      } : {}}
      className="aspect-square rounded-xl flex items-center justify-center relative"
      style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.3)',
      }}
    >
      <motion.div
        animate={spinning ? { rotate: 360 } : {}}
        transition={spinning ? { duration: 0.5, repeat: Infinity, ease: "linear" } : {}}
      >
        <symbol.icon 
          className="w-16 h-16 md:w-20 md:h-20" 
          style={{ 
            color: symbol.color,
            filter: `drop-shadow(0 0 10px ${symbol.color}80)`,
          }} 
        />
      </motion.div>

      {/* Glow effect when not spinning */}
      {!spinning && (
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle, ${symbol.color}20 0%, transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  );
}
