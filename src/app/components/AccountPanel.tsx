import { motion } from 'motion/react';
import { Wallet, TrendingUp, Star, Crown } from 'lucide-react';

export function AccountPanel() {
  const balance = 12450;
  const todayProfit = 3240;
  const vipLevel = 'Diamond';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: 'rgba(10, 14, 39, 0.6)',
        border: '2px solid rgba(255, 213, 138, 0.2)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Decorative gradient */}
      <div 
        className="absolute top-0 left-0 right-0 h-32 opacity-30"
        style={{
          background: 'linear-gradient(180deg, rgba(255, 213, 138, 0.2) 0%, transparent 100%)',
        }}
      />

      {/* Profile Header */}
      <div className="relative mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold relative"
            style={{
              background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
              color: '#0A0E27',
              boxShadow: '0 0 30px rgba(255, 213, 138, 0.5)',
            }}
          >
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">CryptoKing</h3>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#FFD58A]" />
              <span className="text-[#FFD58A] text-sm font-semibold">{vipLevel} Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div 
        className="p-6 rounded-2xl mb-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 181, 94, 0.1) 0%, rgba(255, 213, 138, 0.05) 100%)',
          border: '1px solid rgba(255, 213, 138, 0.3)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-[#FFD58A]" />
          <span className="text-white/70 text-sm">Total Balance</span>
        </div>
        <div className="text-4xl font-bold text-white mb-1">
          ${balance.toLocaleString()}
        </div>
        <div className="text-sm text-white/50">USD</div>

        {/* Decorative glow */}
        <div 
          className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #FFD58A 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Today's Profit"
          value={`+$${todayProfit.toLocaleString()}`}
          positive
        />
        <StatCard
          icon={Star}
          label="Total Wins"
          value="247"
        />
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
            color: '#0A0E27',
            boxShadow: '0 0 20px rgba(255, 213, 138, 0.4)',
          }}
        >
          <Wallet className="w-5 h-5" />
          Deposit
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl font-semibold"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
          }}
        >
          Withdraw
        </motion.button>
      </div>

      {/* VIP Progress */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm">VIP Progress</span>
          <span className="text-[#FFD58A] text-sm font-semibold">78%</span>
        </div>
        <div 
          className="h-2 rounded-full overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '78%' }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #FFB95E 0%, #FFD58A 100%)',
              boxShadow: '0 0 10px rgba(255, 213, 138, 0.5)',
            }}
          />
        </div>
        <p className="text-white/50 text-xs mt-2">
          $2,200 more to reach <span className="text-[#FFD58A]">Platinum</span>
        </p>
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, positive }: { 
  icon: any; 
  label: string; 
  value: string; 
  positive?: boolean 
}) {
  return (
    <div 
      className="p-4 rounded-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Icon className={`w-4 h-4 mb-2 ${positive ? 'text-[#22c55e]' : 'text-[#FFD58A]'}`} />
      <div className="text-white/50 text-xs mb-1">{label}</div>
      <div className={`font-bold ${positive ? 'text-[#22c55e]' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}
