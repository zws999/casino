import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Users, Plus, X, Loader, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { projectId } from '../../../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ffd6497f`;

interface BlackjackLobby {
  id: string;
  creatorId: string;
  creatorUsername: string;
  bet: number;
  players: Array<{
    id: string;
    username: string;
    bet: number;
    ready: boolean;
    hand?: any[];
    status?: string;
    result?: string;
  }>;
  status: string;
  maxPlayers: number;
  gameState?: any;
}

export function BlackjackMultiplayer() {
  const { user, accessToken, refreshUser } = useAuth();
  const [lobbies, setLobbies] = useState<BlackjackLobby[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [currentLobby, setCurrentLobby] = useState<BlackjackLobby | null>(null);

  useEffect(() => {
    fetchLobbies();
    const interval = setInterval(fetchLobbies, 2000);
    return () => clearInterval(interval);
  }, [accessToken]);

  const fetchLobbies = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_URL}/blackjack/lobbies`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLobbies(data.lobbies || []);
        
        // Check if user is in a lobby
        const userLobby = data.lobbies.find((l: BlackjackLobby) =>
          l.players.some(p => p.id === user?.id)
        );
        setCurrentLobby(userLobby || null);
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
      const response = await fetch(`${API_URL}/blackjack/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bet: betAmount }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentLobby(data.lobby);
        setShowCreateModal(false);
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

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/blackjack/join/${lobbyId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentLobby(data.lobby);
        await fetchLobbies();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join lobby');
      }
    } catch (error) {
      console.error('Join lobby error:', error);
      alert('Failed to join lobby');
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    if (!currentLobby || !accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/blackjack/start/${currentLobby.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentLobby(data.lobby);
        await fetchLobbies();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start game');
      }
    } catch (error) {
      console.error('Start game error:', error);
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: 'hit' | 'stand') => {
    if (!currentLobby || !accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/blackjack/action/${currentLobby.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentLobby(data.lobby);
        await refreshUser();
        await fetchLobbies();
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setLoading(false);
    }
  };

  const waitingLobbies = lobbies.filter(l => l.status === 'waiting');

  if (currentLobby && currentLobby.status === 'playing') {
    return <GameView lobby={currentLobby} onAction={performAction} loading={loading} />;
  }

  if (currentLobby && currentLobby.status === 'waiting') {
    return <LobbyWaitingRoom lobby={currentLobby} onStart={startGame} loading={loading} isCreator={currentLobby.creatorId === user?.id} />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Multiplayer Blackjack</h2>
          <p className="text-white/50">Up to 4 players. AI dealer. Beat the house together.</p>
        </div>
        
        {user && !currentLobby && (
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
            Create Table
          </motion.button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {waitingLobbies.length === 0 ? (
          <div className="col-span-2 text-center py-16">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-lg">No active tables</p>
            <p className="text-white/30 text-sm mt-2">Create a table to start playing!</p>
          </div>
        ) : (
          waitingLobbies.map((lobby) => (
            <motion.div
              key={lobby.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl"
              style={{
                background: 'rgba(10, 14, 39, 0.6)',
                border: '2px solid rgba(255, 213, 138, 0.2)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">{lobby.creatorUsername}'s Table</h3>
                <div className="px-3 py-1 rounded-full text-xs font-semibold text-[#FFD58A]" style={{
                  background: 'rgba(255, 213, 138, 0.1)',
                  border: '1px solid rgba(255, 213, 138, 0.3)',
                }}>
                  {lobby.players.length}/{lobby.maxPlayers}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-white/50 text-sm mb-2">Players</div>
                <div className="flex flex-wrap gap-2">
                  {lobby.players.map((player) => (
                    <div
                      key={player.id}
                      className="px-3 py-1 rounded-lg text-sm"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                      }}
                    >
                      {player.username}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-white/50 text-xs mb-1">Bet</div>
                  <div className="text-white font-bold">${lobby.bet}</div>
                </div>
                <div>
                  <div className="text-white/50 text-xs mb-1">Total Pot</div>
                  <div className="text-[#22c55e] font-bold">${lobby.bet * lobby.players.length}</div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => joinLobby(lobby.id)}
                disabled={loading || lobby.players.length >= lobby.maxPlayers}
                className="w-full py-3 rounded-xl font-bold"
                style={lobby.players.length >= lobby.maxPlayers ? {
                  background: 'rgba(100, 100, 100, 0.3)',
                  color: 'rgba(255, 255, 255, 0.3)',
                  cursor: 'not-allowed',
                } : {
                  background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                  color: '#0A0E27',
                  boxShadow: '0 0 20px rgba(255, 213, 138, 0.4)',
                }}
              >
                {lobby.players.length >= lobby.maxPlayers ? 'Table Full' : 'Join Table'}
              </motion.button>
            </motion.div>
          ))
        )}
      </div>

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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-3xl p-8"
              style={{
                background: 'rgba(10, 14, 39, 0.95)',
                border: '2px solid rgba(255, 213, 138, 0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Create Table</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              <div className="mb-6">
                <label className="text-white/70 text-sm block mb-2">Bet Amount (per player)</label>
                <div className="p-4 rounded-xl" style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-white text-2xl font-bold outline-none"
                    min="10"
                    max={user?.balance || 0}
                  />
                  <div className="text-white/50 text-sm mt-2">
                    Balance: ${user?.balance.toLocaleString()}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={createLobby}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-lg"
                style={{
                  background: loading ? 'rgba(100, 100, 100, 0.5)' : 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                  color: '#0A0E27',
                  boxShadow: loading ? 'none' : '0 0 30px rgba(255, 213, 138, 0.4)',
                }}
              >
                {loading ? 'Creating...' : 'Create Table'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LobbyWaitingRoom({ lobby, onStart, loading, isCreator }: any) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-3xl"
        style={{
          background: 'rgba(10, 14, 39, 0.6)',
          border: '2px solid rgba(255, 213, 138, 0.3)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Waiting Room</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: lobby.maxPlayers }).map((_, i) => {
            const player = lobby.players[i];
            return (
              <div
                key={i}
                className="p-6 rounded-2xl text-center"
                style={{
                  background: player ? 'rgba(255, 213, 138, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: `2px solid ${player ? 'rgba(255, 213, 138, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                }}
              >
                {player ? (
                  <>
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl"
                      style={{
                        background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                        color: '#0A0E27',
                      }}
                    >
                      {player.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="text-white font-semibold mb-1">{player.username}</div>
                    <div className="text-[#22c55e] text-sm">✓ Ready</div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-dashed border-white/20">
                      <Users className="w-6 h-6 text-white/30" />
                    </div>
                    <div className="text-white/30 text-sm">Waiting...</div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mb-6">
          <div className="text-white/50 text-sm mb-2">Table Bet</div>
          <div className="text-[#FFD58A] text-3xl font-bold">${lobby.bet}</div>
        </div>

        {isCreator && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            disabled={loading || lobby.players.length < 1}
            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            style={{
              background: loading ? 'rgba(100, 100, 100, 0.5)' : 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
              color: '#0A0E27',
              boxShadow: loading ? 'none' : '0 0 30px rgba(255, 213, 138, 0.4)',
            }}
          >
            <Play className="w-5 h-5" />
            {loading ? 'Starting...' : 'Start Game'}
          </motion.button>
        )}

        {!isCreator && (
          <div className="text-center text-white/50">
            Waiting for host to start the game...
          </div>
        )}
      </motion.div>
    </div>
  );
}

function GameView({ lobby, onAction, loading }: any) {
  const { user } = useAuth();
  const { gameState } = lobby;
  const currentPlayer = gameState?.players[gameState?.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === user?.id;
  const myPlayer = gameState?.players.find((p: any) => p.id === user?.id);

  const dealerValue = calculateHandValue(gameState?.dealerHand || []);
  const showDealerSecondCard = gameState?.status === 'completed';

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div 
        className="rounded-3xl p-8 md:p-12"
        style={{
          background: 'radial-gradient(ellipse at center, #1a5e3f 0%, #0d3424 100%)',
          boxShadow: 'inset 0 0 80px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 213, 138, 0.2)',
        }}
      >
        {/* Dealer */}
        <div className="mb-16">
          <div className="text-center mb-6">
            <div className="inline-block px-6 py-2 rounded-full bg-black/30 border border-yellow-500/30">
              <span className="text-yellow-500/70 text-sm font-semibold tracking-wider">
                DEALER {showDealerSecondCard && `- ${dealerValue}`}
              </span>
            </div>
          </div>
          
          <div className="flex justify-center gap-3 flex-wrap">
            {gameState?.dealerHand?.map((card: any, i: number) => (
              <Card key={i} value={card.value} suit={card.suit} faceDown={!showDealerSecondCard && i === 1} />
            ))}
          </div>
        </div>

        {/* Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {gameState?.players.map((player: any, i: number) => {
            const handValue = calculateHandValue(player.hand);
            const isActive = currentPlayer?.id === player.id;
            
            return (
              <div
                key={player.id}
                className="p-4 rounded-2xl"
                style={{
                  background: isActive ? 'rgba(255, 213, 138, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                  border: `2px solid ${isActive ? 'rgba(255, 213, 138, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold">{player.username}</span>
                  <span className="text-[#FFD58A] text-lg font-bold">{handValue}</span>
                </div>
                
                <div className="flex gap-2 flex-wrap justify-center mb-2">
                  {player.hand?.map((card: any, i: number) => (
                    <Card key={i} value={card.value} suit={card.suit} small />
                  ))}
                </div>

                {player.result && (
                  <div className="text-center text-sm font-semibold">
                    {player.result === 'win' && <span className="text-[#22c55e]">✓ WIN</span>}
                    {player.result === 'lose' && <span className="text-red-400">✗ LOSE</span>}
                    {player.result === 'push' && <span className="text-yellow-400">= PUSH</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        {gameState?.status === 'playing' && isMyTurn && myPlayer?.status === 'playing' && (
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction('hit')}
              disabled={loading}
              className="px-8 py-3 rounded-xl font-semibold"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
              }}
            >
              HIT
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAction('stand')}
              disabled={loading}
              className="px-8 py-3 rounded-xl font-semibold"
              style={{
                background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                color: '#0A0E27',
                boxShadow: '0 0 20px rgba(255, 213, 138, 0.4)',
              }}
            >
              STAND
            </motion.button>
          </div>
        )}

        {gameState?.status === 'playing' && !isMyTurn && (
          <div className="text-center text-white/70">
            Waiting for <span className="text-[#FFD58A] font-semibold">{currentPlayer?.username}</span>...
          </div>
        )}

        {gameState?.status === 'completed' && (
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-4">Game Over</div>
            <div className="text-white/70">Results displayed above</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ value, suit, faceDown, small }: any) {
  const isRed = suit === '♥' || suit === '♦';
  
  if (faceDown) {
    return (
      <motion.div
        className={`${small ? 'w-12 h-16' : 'w-20 h-28'} rounded-lg flex items-center justify-center`}
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          border: '2px solid rgba(255, 213, 138, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className={`absolute ${small ? 'inset-1' : 'inset-2'} border-2 border-white/10 rounded`} />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`${small ? 'w-12 h-16 p-1' : 'w-20 h-28 p-2'} rounded-lg flex flex-col justify-between bg-white`}
      style={{
        border: '2px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className={`${isRed ? 'text-red-600' : 'text-black'} font-bold ${small ? 'text-xs' : 'text-lg'}`}>
        {value}
        <div className={small ? 'text-base' : 'text-2xl'}>{suit}</div>
      </div>
      <div className={`${isRed ? 'text-red-600' : 'text-black'} font-bold ${small ? 'text-xs' : 'text-lg'} text-right transform rotate-180`}>
        {value}
        <div className={small ? 'text-base' : 'text-2xl'}>{suit}</div>
      </div>
    </motion.div>
  );
}

function calculateHandValue(hand: any[]) {
  if (!hand) return 0;
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.value === 'A') {
      aces++;
      value += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}