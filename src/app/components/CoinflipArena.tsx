import { motion } from 'motion/react';
import { useState } from 'react';
import { Users, TrendingUp } from 'lucide-react';

interface Room {
  id: number;
  player: string;
  bet: number;
  side: 'heads' | 'tails';
  status: 'waiting' | 'full';
}

const mockRooms: Room[] = [
  { id: 1, player: 'CryptoKing', bet: 500, side: 'heads', status: 'waiting' },
  { id: 2, player: 'DiamondHands', bet: 250, side: 'tails', status: 'waiting' },
  { id: 3, player: 'LuckyAce', bet: 1000, side: 'heads', status: 'waiting' },
  { id: 4, player: 'MoonShot', bet: 750, side: 'tails', status: 'full' },
];

export function CoinflipArena() {
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [flipping, setFlipping] = useState(false);

  const flipCoin = () => {
    setFlipping(true);
    setTimeout(() => setFlipping(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Coinflip Arena</h2>
        <p className="text-white/50">1v1 battles. Double or nothing. Pure skill.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Flip Interface */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: 'rgba(10, 14, 39, 0.6)',
            border: '2px solid rgba(255, 213, 138, 0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Coin Display */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={flipping ? {
                rotateY: [0, 1800],
              } : {}}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="relative"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div 
                className="w-40 h-40 rounded-full flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                  boxShadow: '0 0 60px rgba(255, 213, 138, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.3)',
                  border: '4px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <div className="text-6xl font-bold text-[#0A0E27]">
                  {selectedSide === 'heads' ? 'H' : 'T'}
                </div>
                
                {/* Inner ring */}
                <div 
                  className="absolute inset-4 rounded-full"
                  style={{
                    border: '2px solid rgba(10, 14, 39, 0.2)',
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Side Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <SideButton
              active={selectedSide === 'heads'}
              onClick={() => setSelectedSide('heads')}
              label="HEADS"
            />
            <SideButton
              active={selectedSide === 'tails'}
              onClick={() => setSelectedSide('tails')}
              label="TAILS"
            />
          </div>

          {/* Bet Input */}
          <div 
            className="p-4 rounded-xl mb-6"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <label className="text-white/50 text-sm block mb-2">Bet Amount</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                defaultValue={100}
                className="flex-1 bg-transparent text-white text-2xl font-bold outline-none"
                style={{ border: 'none' }}
              />
              <span className="text-[#FFD58A] text-xl">USD</span>
            </div>
          </div>

          {/* Create Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={flipCoin}
            className="w-full py-4 rounded-xl font-bold text-lg"
            style={{
              background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
              color: '#0A0E27',
              boxShadow: '0 0 30px rgba(255, 213, 138, 0.4)',
            }}
          >
            CREATE FLIP
          </motion.button>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
              <div className="text-white/50 text-xs mb-1">Your Wins</div>
              <div className="text-white font-bold text-xl">24</div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
              <div className="text-white/50 text-xs mb-1">Win Rate</div>
              <div className="text-[#22c55e] font-bold text-xl">68%</div>
            </div>
          </div>
        </motion.div>

        {/* Active Rooms */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: 'rgba(10, 14, 39, 0.6)',
            border: '2px solid rgba(255, 213, 138, 0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FFD58A]" />
              Live Rooms
            </h3>
            <div className="px-3 py-1 rounded-full text-xs font-semibold text-[#FFD58A]" style={{
              background: 'rgba(255, 213, 138, 0.1)',
              border: '1px solid rgba(255, 213, 138, 0.3)',
            }}>
              {mockRooms.filter(r => r.status === 'waiting').length} Active
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {mockRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SideButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="py-4 rounded-xl font-bold relative overflow-hidden"
      style={active ? {
        background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
        color: '#0A0E27',
        border: '2px solid rgba(255, 213, 138, 0.5)',
        boxShadow: '0 0 20px rgba(255, 213, 138, 0.4)',
      } : {
        background: 'rgba(255, 255, 255, 0.05)',
        color: 'white',
        border: '2px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {label}
    </motion.button>
  );
}

function RoomCard({ room }: { room: Room }) {
  const isWaiting = room.status === 'waiting';
  
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="p-4 rounded-xl relative overflow-hidden"
      style={{
        background: isWaiting 
          ? 'rgba(255, 213, 138, 0.05)' 
          : 'rgba(100, 100, 100, 0.05)',
        border: `1px solid ${isWaiting ? 'rgba(255, 213, 138, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
              color: '#0A0E27',
            }}
          >
            {room.player.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-white font-semibold">{room.player}</div>
            <div className="text-white/50 text-xs">Choose {room.side}</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-[#FFD58A] font-bold text-lg">${room.bet}</div>
          <div className="text-white/50 text-xs">pot: ${room.bet * 2}</div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: isWaiting ? 1.02 : 1 }}
        whileTap={{ scale: isWaiting ? 0.98 : 1 }}
        disabled={!isWaiting}
        className="w-full py-2 rounded-lg text-sm font-semibold"
        style={isWaiting ? {
          background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
          color: '#0A0E27',
        } : {
          background: 'rgba(100, 100, 100, 0.3)',
          color: 'rgba(255, 255, 255, 0.3)',
          cursor: 'not-allowed',
        }}
      >
        {isWaiting ? 'JOIN ROOM' : 'IN PROGRESS'}
      </motion.button>
    </motion.div>
  );
}
