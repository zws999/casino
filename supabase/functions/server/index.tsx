import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Auth middleware
async function requireAuth(c: any, next: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
}

// Health check endpoint
app.get("/make-server-ffd6497f/health", (c) => {
  return c.json({ status: "ok" });
});

// ===================
// AUTH ENDPOINTS
// ===================

app.post("/make-server-ffd6497f/signup", async (c) => {
  try {
    const { email, password, username } = await c.req.json();

    if (!email || !password || !username) {
      return c.json({ error: 'Email, password, and username are required' }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true, // Auto-confirm since we don't have email server
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user balance in KV store
    await kv.set(`user:${data.user.id}:balance`, 10000); // Starting balance: $10,000
    await kv.set(`user:${data.user.id}:stats`, {
      totalWins: 0,
      totalLosses: 0,
      gamesPlayed: 0,
      biggestWin: 0,
    });

    return c.json({ 
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata.username,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// ===================
// USER ENDPOINTS
// ===================

app.get("/make-server-ffd6497f/user/profile", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');

    const balance = await kv.get(`user:${userId}:balance`) || 10000;
    const stats = await kv.get(`user:${userId}:stats`) || {
      totalWins: 0,
      totalLosses: 0,
      gamesPlayed: 0,
      biggestWin: 0,
    };

    // Get user metadata from Supabase
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const username = user?.user_metadata?.username || userEmail?.split('@')[0] || 'Player';

    return c.json({
      id: userId,
      email: userEmail,
      username,
      balance,
      stats,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to get user profile' }, 500);
  }
});

app.post("/make-server-ffd6497f/user/update-balance", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { amount } = await c.req.json();

    if (typeof amount !== 'number') {
      return c.json({ error: 'Invalid amount' }, 400);
    }

    const currentBalance = await kv.get(`user:${userId}:balance`) || 10000;
    const newBalance = currentBalance + amount;

    if (newBalance < 0) {
      return c.json({ error: 'Insufficient balance' }, 400);
    }

    await kv.set(`user:${userId}:balance`, newBalance);

    return c.json({ balance: newBalance });
  } catch (error) {
    console.error('Update balance error:', error);
    return c.json({ error: 'Failed to update balance' }, 500);
  }
});

// ===================
// COINFLIP ENDPOINTS
// ===================

app.get("/make-server-ffd6497f/coinflip/lobbies", requireAuth, async (c) => {
  try {
    const lobbies = await kv.getByPrefix('coinflip:lobby:') || [];
    
    // Filter out completed/expired lobbies
    const activeLobbies = lobbies.filter((lobby: any) => 
      lobby.status === 'waiting' || lobby.status === 'playing'
    );

    return c.json({ lobbies: activeLobbies });
  } catch (error) {
    console.error('Get lobbies error:', error);
    return c.json({ error: 'Failed to get lobbies' }, 500);
  }
});

app.post("/make-server-ffd6497f/coinflip/create", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { bet, side } = await c.req.json();

    if (!bet || !side || (side !== 'heads' && side !== 'tails')) {
      return c.json({ error: 'Invalid bet or side' }, 400);
    }

    // Check balance
    const balance = await kv.get(`user:${userId}:balance`) || 0;
    if (balance < bet) {
      return c.json({ error: 'Insufficient balance' }, 400);
    }

    // Get user info
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const username = user?.user_metadata?.username || 'Player';

    // Deduct bet from balance
    await kv.set(`user:${userId}:balance`, balance - bet);

    // Create lobby
    const lobbyId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const lobby = {
      id: lobbyId,
      creatorId: userId,
      creatorUsername: username,
      creatorSide: side,
      bet,
      status: 'waiting',
      createdAt: Date.now(),
    };

    await kv.set(`coinflip:lobby:${lobbyId}`, lobby);

    return c.json({ lobby });
  } catch (error) {
    console.error('Create lobby error:', error);
    return c.json({ error: 'Failed to create lobby' }, 500);
  }
});

app.post("/make-server-ffd6497f/coinflip/join/:lobbyId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const lobbyId = c.req.param('lobbyId');

    const lobby = await kv.get(`coinflip:lobby:${lobbyId}`);
    if (!lobby) {
      return c.json({ error: 'Lobby not found' }, 404);
    }

    if (lobby.status !== 'waiting') {
      return c.json({ error: 'Lobby is not available' }, 400);
    }

    if (lobby.creatorId === userId) {
      return c.json({ error: 'Cannot join your own lobby' }, 400);
    }

    // Check balance
    const balance = await kv.get(`user:${userId}:balance`) || 0;
    if (balance < lobby.bet) {
      return c.json({ error: 'Insufficient balance' }, 400);
    }

    // Get user info
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const username = user?.user_metadata?.username || 'Player';

    // Deduct bet from balance
    await kv.set(`user:${userId}:balance`, balance - lobby.bet);

    // Flip coin
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const creatorWon = result === lobby.creatorSide;
    const winnerId = creatorWon ? lobby.creatorId : userId;
    const winnerUsername = creatorWon ? lobby.creatorUsername : username;
    const winAmount = lobby.bet * 2;

    // Update winner's balance
    const winnerBalance = await kv.get(`user:${winnerId}:balance`) || 0;
    await kv.set(`user:${winnerId}:balance`, winnerBalance + winAmount);

    // Update stats
    const winnerStats = await kv.get(`user:${winnerId}:stats`) || {
      totalWins: 0,
      totalLosses: 0,
      gamesPlayed: 0,
      biggestWin: 0,
    };
    winnerStats.totalWins += 1;
    winnerStats.gamesPlayed += 1;
    winnerStats.biggestWin = Math.max(winnerStats.biggestWin, winAmount);
    await kv.set(`user:${winnerId}:stats`, winnerStats);

    const loserId = creatorWon ? userId : lobby.creatorId;
    const loserStats = await kv.get(`user:${loserId}:stats`) || {
      totalWins: 0,
      totalLosses: 0,
      gamesPlayed: 0,
      biggestWin: 0,
    };
    loserStats.totalLosses += 1;
    loserStats.gamesPlayed += 1;
    await kv.set(`user:${loserId}:stats`, loserStats);

    // Update lobby
    lobby.joinerUsername = username;
    lobby.joinerId = userId;
    lobby.result = result;
    lobby.winnerId = winnerId;
    lobby.winnerUsername = winnerUsername;
    lobby.status = 'completed';
    await kv.set(`coinflip:lobby:${lobbyId}`, lobby);

    return c.json({ 
      result,
      winnerId,
      winnerUsername,
      winAmount,
      lobby,
    });
  } catch (error) {
    console.error('Join lobby error:', error);
    return c.json({ error: 'Failed to join lobby' }, 500);
  }
});

app.delete("/make-server-ffd6497f/coinflip/cancel/:lobbyId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const lobbyId = c.req.param('lobbyId');

    const lobby = await kv.get(`coinflip:lobby:${lobbyId}`);
    if (!lobby) {
      return c.json({ error: 'Lobby not found' }, 404);
    }

    if (lobby.creatorId !== userId) {
      return c.json({ error: 'Only creator can cancel lobby' }, 403);
    }

    if (lobby.status !== 'waiting') {
      return c.json({ error: 'Cannot cancel lobby in progress' }, 400);
    }

    // Refund bet to creator
    const balance = await kv.get(`user:${userId}:balance`) || 0;
    await kv.set(`user:${userId}:balance`, balance + lobby.bet);

    // Delete lobby
    await kv.del(`coinflip:lobby:${lobbyId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Cancel lobby error:', error);
    return c.json({ error: 'Failed to cancel lobby' }, 500);
  }
});

// ===================
// BLACKJACK ENDPOINTS
// ===================

app.get("/make-server-ffd6497f/blackjack/lobbies", requireAuth, async (c) => {
  try {
    const lobbies = await kv.getByPrefix('blackjack:lobby:') || [];
    
    // Filter active lobbies
    const activeLobbies = lobbies.filter((lobby: any) => 
      lobby.status === 'waiting' || lobby.status === 'playing'
    );

    return c.json({ lobbies: activeLobbies });
  } catch (error) {
    console.error('Get blackjack lobbies error:', error);
    return c.json({ error: 'Failed to get lobbies' }, 500);
  }
});

app.post("/make-server-ffd6497f/blackjack/create", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { bet } = await c.req.json();

    if (!bet || bet <= 0) {
      return c.json({ error: 'Invalid bet amount' }, 400);
    }

    // Check balance
    const balance = await kv.get(`user:${userId}:balance`) || 0;
    if (balance < bet) {
      return c.json({ error: 'Insufficient balance' }, 400);
    }

    // Get user info
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const username = user?.user_metadata?.username || 'Player';

    // Create lobby
    const lobbyId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const lobby = {
      id: lobbyId,
      creatorId: userId,
      creatorUsername: username,
      bet,
      players: [{
        id: userId,
        username,
        bet,
        ready: true,
      }],
      status: 'waiting',
      maxPlayers: 4,
      createdAt: Date.now(),
    };

    await kv.set(`blackjack:lobby:${lobbyId}`, lobby);

    return c.json({ lobby });
  } catch (error) {
    console.error('Create blackjack lobby error:', error);
    return c.json({ error: 'Failed to create lobby' }, 500);
  }
});

app.post("/make-server-ffd6497f/blackjack/join/:lobbyId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const lobbyId = c.req.param('lobbyId');

    const lobby = await kv.get(`blackjack:lobby:${lobbyId}`);
    if (!lobby) {
      return c.json({ error: 'Lobby not found' }, 404);
    }

    if (lobby.status !== 'waiting') {
      return c.json({ error: 'Lobby is not available' }, 400);
    }

    if (lobby.players.some((p: any) => p.id === userId)) {
      return c.json({ error: 'Already in lobby' }, 400);
    }

    if (lobby.players.length >= lobby.maxPlayers) {
      return c.json({ error: 'Lobby is full' }, 400);
    }

    // Check balance
    const balance = await kv.get(`user:${userId}:balance`) || 0;
    if (balance < lobby.bet) {
      return c.json({ error: 'Insufficient balance' }, 400);
    }

    // Get user info
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const username = user?.user_metadata?.username || 'Player';

    // Add player to lobby
    lobby.players.push({
      id: userId,
      username,
      bet: lobby.bet,
      ready: true,
    });

    await kv.set(`blackjack:lobby:${lobbyId}`, lobby);

    return c.json({ lobby });
  } catch (error) {
    console.error('Join blackjack lobby error:', error);
    return c.json({ error: 'Failed to join lobby' }, 500);
  }
});

app.post("/make-server-ffd6497f/blackjack/start/:lobbyId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const lobbyId = c.req.param('lobbyId');

    const lobby = await kv.get(`blackjack:lobby:${lobbyId}`);
    if (!lobby) {
      return c.json({ error: 'Lobby not found' }, 404);
    }

    if (lobby.creatorId !== userId) {
      return c.json({ error: 'Only creator can start game' }, 403);
    }

    if (lobby.status !== 'waiting') {
      return c.json({ error: 'Game already started' }, 400);
    }

    // Deduct bets from all players
    for (const player of lobby.players) {
      const balance = await kv.get(`user:${player.id}:balance`) || 0;
      await kv.set(`user:${player.id}:balance`, balance - lobby.bet);
    }

    // Initialize game state
    const deck = createDeck();
    shuffle(deck);

    const gameState = {
      deck,
      dealerHand: [drawCard(deck), drawCard(deck)],
      players: lobby.players.map((player: any) => ({
        ...player,
        hand: [drawCard(deck), drawCard(deck)],
        status: 'playing',
        bet: lobby.bet,
      })),
      currentPlayerIndex: 0,
      status: 'playing',
    };

    lobby.status = 'playing';
    lobby.gameState = gameState;
    await kv.set(`blackjack:lobby:${lobbyId}`, lobby);

    return c.json({ lobby });
  } catch (error) {
    console.error('Start blackjack game error:', error);
    return c.json({ error: 'Failed to start game' }, 500);
  }
});

app.post("/make-server-ffd6497f/blackjack/action/:lobbyId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const lobbyId = c.req.param('lobbyId');
    const { action } = await c.req.json(); // 'hit' or 'stand'

    const lobby = await kv.get(`blackjack:lobby:${lobbyId}`);
    if (!lobby || !lobby.gameState) {
      return c.json({ error: 'Game not found' }, 404);
    }

    const { gameState } = lobby;
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (currentPlayer.id !== userId) {
      return c.json({ error: 'Not your turn' }, 403);
    }

    if (action === 'hit') {
      const card = drawCard(gameState.deck);
      currentPlayer.hand.push(card);

      const handValue = calculateHandValue(currentPlayer.hand);
      if (handValue > 21) {
        currentPlayer.status = 'bust';
        gameState.currentPlayerIndex++;
      }
    } else if (action === 'stand') {
      currentPlayer.status = 'stand';
      gameState.currentPlayerIndex++;
    }

    // Check if all players finished
    if (gameState.currentPlayerIndex >= gameState.players.length) {
      // Dealer plays
      while (calculateHandValue(gameState.dealerHand) < 17) {
        gameState.dealerHand.push(drawCard(gameState.deck));
      }

      const dealerValue = calculateHandValue(gameState.dealerHand);
      const dealerBusted = dealerValue > 21;

      // Determine winners and pay out
      for (const player of gameState.players) {
        const playerValue = calculateHandValue(player.hand);
        let winAmount = 0;

        if (player.status === 'bust') {
          // Player loses
          player.result = 'lose';
        } else if (dealerBusted || playerValue > dealerValue) {
          // Player wins
          player.result = 'win';
          winAmount = player.bet * 2;
        } else if (playerValue === dealerValue) {
          // Push
          player.result = 'push';
          winAmount = player.bet;
        } else {
          // Player loses
          player.result = 'lose';
        }

        if (winAmount > 0) {
          const balance = await kv.get(`user:${player.id}:balance`) || 0;
          await kv.set(`user:${player.id}:balance`, balance + winAmount);
        }

        // Update stats
        const stats = await kv.get(`user:${player.id}:stats`) || {
          totalWins: 0,
          totalLosses: 0,
          gamesPlayed: 0,
          biggestWin: 0,
        };
        stats.gamesPlayed += 1;
        if (player.result === 'win') {
          stats.totalWins += 1;
          stats.biggestWin = Math.max(stats.biggestWin, winAmount);
        } else if (player.result === 'lose') {
          stats.totalLosses += 1;
        }
        await kv.set(`user:${player.id}:stats`, stats);
      }

      gameState.status = 'completed';
      lobby.status = 'completed';
    }

    await kv.set(`blackjack:lobby:${lobbyId}`, lobby);

    return c.json({ lobby });
  } catch (error) {
    console.error('Blackjack action error:', error);
    return c.json({ error: 'Failed to perform action' }, 500);
  }
});

// ===================
// HELPER FUNCTIONS
// ===================

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ value, suit });
    }
  }
  return deck;
}

function shuffle(deck: any[]) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function drawCard(deck: any[]) {
  return deck.pop();
}

function calculateHandValue(hand: any[]) {
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

Deno.serve(app.fetch);
