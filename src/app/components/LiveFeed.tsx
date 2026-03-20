import { motion } from 'motion/react';
import { TrendingUp, Trophy, Zap } from 'lucide-react';

interface Activity {
  id: number;
  user: string;
  game: string;
  amount: number;
  type: 'win' | 'join' | 'jackpot';
  time: string;
}

const activities: Activity[] = [
  { id: 1, user: 'CryptoKing', game: 'Slots', amount: 2500, type: 'win', time: '2m ago' },
  { id: 2, user: 'DiamondHands', game: 'Blackjack', amount: 1200, type: 'win', time: '3m ago' },
  { id: 3, user: 'LuckyAce', game: 'Coinflip', amount: 5000, type: 'jackpot', time: '5m ago' },
  { id: 4, user: 'MoonShot', game: 'Slots', amount: 800, type: 'win', time: '7m ago' },
  { id: 5, user: 'WhaleGamer', game: 'Blackjack', amount: 3200, type: 'win', time: '9m ago' },
  { id: 6, user: 'RoyalFlush', game: 'Coinflip', amount: 1500, type: 'join', time: '11m ago' },
];

export function LiveFeed() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#FFD58A]" />
          Live Activity
        </h3>
        <div 
          className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"
          style={{
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.8)',
          }}
        />
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ActivityCard activity={activity} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'jackpot':
        return <Trophy className="w-4 h-4 text-[#FFD58A]" />;
      case 'win':
        return <TrendingUp className="w-4 h-4 text-[#22c55e]" />;
      default:
        return <Zap className="w-4 h-4 text-[#3b82f6]" />;
    }
  };

  const getBorderColor = () => {
    switch (activity.type) {
      case 'jackpot':
        return 'rgba(255, 213, 138, 0.3)';
      case 'win':
        return 'rgba(34, 197, 94, 0.2)';
      default:
        return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const getGlow = () => {
    if (activity.type === 'jackpot') {
      return '0 0 20px rgba(255, 213, 138, 0.3)';
    }
    return 'none';
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="p-4 rounded-xl relative overflow-hidden"
      style={{
        background: 'rgba(10, 14, 39, 0.4)',
        border: `1px solid ${getBorderColor()}`,
        backdropFilter: 'blur(10px)',
        boxShadow: getGlow(),
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-white font-semibold truncate">{activity.user}</span>
              <span className="text-white/50 text-xs flex-shrink-0">{activity.time}</span>
            </div>
            <p className="text-white/70 text-sm mb-2">
              {activity.type === 'jackpot' && '🎰 Hit JACKPOT on '}
              {activity.type === 'win' && '✨ Won on '}
              {activity.type === 'join' && '🎮 Joined '}
              <span className="text-[#FFD58A]">{activity.game}</span>
            </p>
            <div className="flex items-center gap-2">
              <div 
                className="px-3 py-1 rounded-md text-sm font-bold"
                style={{
                  background: activity.type === 'jackpot' 
                    ? 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)'
                    : 'rgba(34, 197, 94, 0.15)',
                  color: activity.type === 'jackpot' ? '#0A0E27' : '#22c55e',
                }}
              >
                +${activity.amount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jackpot shimmer effect */}
      {activity.type === 'jackpot' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
      )}
    </motion.div>
  );
}
