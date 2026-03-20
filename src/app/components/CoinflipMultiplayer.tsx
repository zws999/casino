import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Users, TrendingUp, Plus, X, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { projectId } from '../../../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ffd6497f`;

interface Lobby {
  id: string;
  creatorUsername: string;
  creatorSide: 'heads' | 'tails';
  bet: number;
  status: string;
  createdAt: number;
  result?: 'heads' | 'tails';
  winnerUsername?: string;
  joinerUsername?: string;
}

export function CoinflipMultiplayer() {
  const { user, accessToken, refreshUser } = useAuth();
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [loading, setLoading] = useState(false);
  const [myLobby, setMyLobby] = useState<Lobby | null>(null);
  const [flippingLobby, setFlippingLobby] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchLobbies();
    const interval = setInterval(fetchLobbies, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [accessToken]);

  const fetchLobbies = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_URL}/coinflip/lobbies`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLobbies(data.lobbies || []);
        
        // Check if user has an active lobby
        const userLobby = data.lobbies.find((l: Lobby) => 
          l.status === 'waiting' && l.creatorUsername === user?.username
        );
        setMyLobby(userLobby || null);
      }
    } catch (error) {
      console.error('Fetch lobbies error:', error);
    }
  };

  const createLobby = async () => {
    if (!accessToken || !user) return;

    if (betAmount <= 0 || betAmount > user.balance) {
      alert('Invalid bet amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/coinflip/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          bet: betAmount,
          side: selectedSide,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMyLobby(data.lobby);
        setShowCreateModal(false);
        await refreshUser();
        await fetchLobbies();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create lobby');
      }
    } catch (error) {
      console.error('Create lobby error:', error);
      alert('Failed to create lobby');
    } finally {
      setLoading(false);
    }
  };

  const joinLobby = async (lobbyId: string) => {
    if (!accessToken) return;

    setFlippingLobby(lobbyId);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/coinflip/join/${lobbyId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        
        // Wait 2 seconds to show animation
        setTimeout(async () => {
          await refreshUser();
          await fetchLobbies();
          setFlippingLobby(null);
          
          // Show result for 3 seconds
          setTimeout(() => {
            setResult(null);
          }, 3000);
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join lobby');
        setFlippingLobby(null);
      }
    } catch (error) {
      console.error('Join lobby error:', error);
      alert('Failed to join lobby');
      setFlippingLobby(null);
    } finally {
      setLoading(false);
    }
  };

  const cancelLobby = async () => {
    if (!accessToken || !myLobby) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/coinflip/cancel/${myLobby.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setMyLobby(null);
        await refreshUser();
        await fetchLobbies();
      }
    } catch (error) {
      console.error('Cancel lobby error:', error);
    } finally {
      setLoading(false);
    }
  };

  const waitingLobbies = lobbies.filter(l => l.status === 'waiting');

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Coinflip Arena</h2>
          <p className="text-white/50">1v1 battles. Real players. Double or nothing.</p>
        </div>
        
        {user && !myLobby && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl font-bold flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
              color: '#0A0E27',
              boxShadow: '0 0 30px rgba(255, 213, 138, 0.4)',
            }}
          >
            <Plus className="w-5 h-5" />
            Create Lobby
          </motion.button>
        )}
      </div>

      {/* My Active Lobby */}
      {myLobby && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-3xl"
          style={{
            background: 'rgba(255, 213, 138, 0.1)',
            border: '2px solid rgba(255, 213, 138, 0.3)',
            boxShadow: '0 0 30px rgba(255, 213, 138, 0.2)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Your Lobby</h3>
              <p className="text-[#FFD58A] text-sm">Waiting for opponent...</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cancelLobby}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-semibold"
            >
              Cancel
            </motion.button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-white/50 text-sm mb-1">Bet Amount</div>
              <div className="text-white font-bold text-lg">${myLobby.bet}</div>
            </div>
            <div>
              <div className="text-white/50 text-sm mb-1">Your Side</div>
              <div className="text-[#FFD58A] font-bold text-lg capitalize">{myLobby.creatorSide}</div>
            </div>
            <div>
              <div className="text-white/50 text-sm mb-1">Pot</div>
              <div className="text-[#22c55e] font-bold text-lg">${myLobby.bet * 2}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Lobbies Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {waitingLobbies.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-lg">No active lobbies</p>
            <p className="text-white/30 text-sm mt-2">Create one to start playing!</p>
          </div>
        ) : (
          waitingLobbies.map((lobby) => (
            <LobbyCard
              key={lobby.id}
              lobby={lobby}
              onJoin={joinLobby}
              isFlipping={flippingLobby === lobby.id}
              disabled={loading || !!myLobby || lobby.creatorUsername === user?.username}
              isOwn={lobby.creatorUsername === user?.username}
            />
          ))
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
            }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-3xl p-8"
              style={{
                background: 'rgba(10, 14, 39, 0.95)',
                border: '2px solid rgba(255, 213, 138, 0.3)',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Create Lobby</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {/* Coin Display */}
              <div className="flex justify-center mb-6">
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                    boxShadow: '0 0 40px rgba(255, 213, 138, 0.5)',
                    border: '4px solid rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <div className="text-5xl font-bold text-[#0A0E27]">
                    {selectedSide === 'heads' ? 'H' : 'T'}
                  </div>
                </div>
              </div>

              {/* Side Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
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

              {/* Bet Amount */}
              <div className="mb-6">
                <label className="text-white/70 text-sm block mb-2">Bet Amount</label>
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-white text-2xl font-bold outline-none"
                    min="10"
                    max={user?.balance || 0}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white/50 text-sm">Balance: ${user?.balance.toLocaleString()}</span>
                    <span className="text-[#FFD58A] text-sm">Pot: ${betAmount * 2}</span>
                  </div>
                </div>
              </div>

              {/* Create Button */}
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={createLobby}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-lg"
                style={{
                  background: loading 
                    ? 'rgba(100, 100, 100, 0.5)' 
                    : 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                  color: '#0A0E27',
                  boxShadow: loading ? 'none' : '0 0 30px rgba(255, 213, 138, 0.4)',
                }}
              >
                {loading ? 'Creating...' : 'Create Lobby'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 1 }}
                className="w-48 h-48 rounded-full flex items-center justify-center mx-auto mb-8"
                style={{
                  background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                  boxShadow: '0 0 80px rgba(255, 213, 138, 0.8)',
                  border: '6px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <div className="text-8xl font-bold text-[#0A0E27]">
                  {result.result === 'heads' ? 'H' : 'T'}
                </div>
              </motion.div>

              <h2 className="text-4xl font-bold text-white mb-4">
                {result.winnerId === user?.id ? '🎉 YOU WON! 🎉' : '😔 You Lost'}
              </h2>
              <p className="text-2xl text-[#FFD58A] mb-2">
                ${result.winAmount.toLocaleString()}
              </p>
              <p className="text-white/70">
                Winner: <span className="text-white font-semibold">{result.winnerUsername}</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SideButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="py-3 rounded-xl font-bold"
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

function LobbyCard({ lobby, onJoin, isFlipping, disabled, isOwn }: {
  lobby: Lobby;
  onJoin: (id: string) => void;
  isFlipping: boolean;
  disabled: boolean;
  isOwn: boolean;
}) {
  const opposingSide = lobby.creatorSide === 'heads' ? 'tails' : 'heads';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: disabled ? 0 : 4 }}
      className="p-6 rounded-2xl"
      style={{
        background: isOwn 
          ? 'rgba(255, 213, 138, 0.05)' 
          : 'rgba(10, 14, 39, 0.6)',
        border: `2px solid ${isOwn ? 'rgba(255, 213, 138, 0.3)' : 'rgba(255, 213, 138, 0.2)'}`,
        backdropFilter: 'blur(20px)',
        opacity: disabled && !isOwn ? 0.5 : 1,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
            style={{
              background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
              color: '#0A0E27',
            }}
          >
            {lobby.creatorUsername.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-white font-bold">{lobby.creatorUsername}</div>
            <div className="text-white/50 text-sm">
              Choose <span className="text-[#FFD58A] capitalize">{lobby.creatorSide}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-white/50 text-xs mb-1">Bet</div>
          <div className="text-white font-bold text-lg">${lobby.bet}</div>
        </div>
        <div>
          <div className="text-white/50 text-xs mb-1">Pot</div>
          <div className="text-[#22c55e] font-bold text-lg">${lobby.bet * 2}</div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: (!disabled && !isOwn) ? 1.02 : 1 }}
        whileTap={{ scale: (!disabled && !isOwn) ? 0.98 : 1 }}
        onClick={() => !disabled && !isOwn && onJoin(lobby.id)}
        disabled={disabled || isOwn}
        className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        style={isOwn ? {
          background: 'rgba(255, 213, 138, 0.2)',
          color: '#FFD58A',
          cursor: 'default',
        } : (!disabled ? {
          background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
          color: '#0A0E27',
          boxShadow: '0 0 20px rgba(255, 213, 138, 0.4)',
        } : {
          background: 'rgba(100, 100, 100, 0.3)',
          color: 'rgba(255, 255, 255, 0.3)',
          cursor: 'not-allowed',
        })}
      >
        {isFlipping ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Flipping...
          </>
        ) : isOwn ? (
          'Your Lobby'
        ) : (
          `Join as ${opposingSide.toUpperCase()}`
        )}
      </motion.button>
    </motion.div>
  );
}