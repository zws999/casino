import { motion } from 'motion/react';
import { Sparkles, Coins, Spade, Dices } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 181, 94, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(138, 155, 255, 0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute w-1 h-1 bg-[#FFD58A] rounded-full"
            style={{
              boxShadow: '0 0 4px rgba(255, 213, 138, 0.8)',
            }}
          />
        ))}
      </div>

      {/* Floating Icons */}
      <FloatingIcon Icon={Coins} delay={0} x={-200} y={-100} />
      <FloatingIcon Icon={Spade} delay={1} x={200} y={-150} />
      <FloatingIcon Icon={Dices} delay={2} x={-150} y={100} />
      <FloatingIcon Icon={Sparkles} delay={1.5} x={250} y={80} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'rgba(255, 213, 138, 0.1)',
              border: '1px solid rgba(255, 213, 138, 0.2)',
            }}
          >
            <Sparkles className="w-4 h-4 text-[#FFD58A]" />
            <span className="text-sm text-[#FFD58A] tracking-wide">EXCLUSIVE PREMIUM PLATFORM</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            <span className="block text-white">Spin. Win.</span>
            <span 
              className="block bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 50%, #FFF 100%)',
              }}
            >
              Dominate.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience the ultimate luxury casino. Elite games, instant payouts, exclusive rewards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-xl text-lg font-semibold relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #FFB95E 0%, #FFD58A 100%)',
                color: '#0A0E27',
                boxShadow: '0 0 40px rgba(255, 213, 138, 0.5)',
              }}
            >
              <span className="relative z-10">Start Playing</span>
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-xl text-lg font-semibold transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
              }}
            >
              Explore Games
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to top, rgba(5, 7, 19, 1), transparent)',
        }}
      />
    </section>
  );
}

function FloatingIcon({ Icon, delay, x, y }: { Icon: any; delay: number; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        y: [0, -20, 0],
        rotate: [0, 10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className="absolute hidden lg:block"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
      }}
    >
      <div 
        className="p-4 rounded-2xl"
        style={{
          background: 'rgba(255, 213, 138, 0.05)',
          border: '1px solid rgba(255, 213, 138, 0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Icon className="w-8 h-8 text-[#FFD58A]" style={{
          filter: 'drop-shadow(0 0 8px rgba(255, 213, 138, 0.4))',
        }} />
      </div>
    </motion.div>
  );
}
