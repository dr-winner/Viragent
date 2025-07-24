import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Zap, 
  Brain, 
  Users, 
  TrendingUp, 
  Shield,
  Rocket,
  ArrowRight,
  Play,
  Globe,
  Zap as Lightning,
  Twitter,
  Facebook,
  Music,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { VideoPlayer } from '@/components/VideoPlayer';
import heroImage from '@/assets/hero-bg.jpg';

gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showVideoDemo, setShowVideoDemo] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleWatchDemo = () => {
    setShowVideoDemo(true);
  };

  useEffect(() => {
    // Features scroll animation only - removed conflicting hero animations
    ScrollTrigger.create({
      trigger: '.features-grid',
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo('.feature-card', 
          { opacity: 0, y: 80, scale: 0.9 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            duration: 0.6, 
            stagger: 0.15,
            ease: 'power3.out' 
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Content',
      description: 'Generate engaging captions and hashtags with advanced AI that understands your brand voice.',
      color: 'text-primary'
    },
    {
      icon: Zap,
      title: 'Smart Scheduling',
      description: 'Post at optimal times across all platforms with intelligent scheduling algorithms.',
      color: 'text-accent'
    },
    {
      icon: TrendingUp,
      title: 'Viral Prediction',
      description: 'Get engagement predictions and viral score analysis before you post.',
      color: 'text-web3-purple'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work seamlessly with your team using role-based access and approval workflows.',
      color: 'text-web3-cyan'
    },
    {
      icon: Shield,
      title: 'Web3 Security',
      description: 'Built on ICP blockchain with Internet Identity for maximum security and privacy.',
      color: 'text-success'
    },
    {
      icon: Sparkles,
      title: 'Multi-Platform',
      description: 'Manage Twitter, Instagram, TikTok, and more from one powerful dashboard.',
      color: 'text-web3-pink'
    }
  ];

  const partners = [
    { name: 'Internet Computer', icon: Globe, color: 'text-blue-400' },
    { name: 'GitHub Models', icon: Lightning, color: 'text-purple-400' },
    { name: 'Twitter API', icon: Twitter, color: 'text-blue-500' },
    { name: 'Meta', icon: Facebook, color: 'text-blue-600' },
    { name: 'TikTok', icon: Music, color: 'text-pink-500' },
    { name: 'Discord', icon: MessageCircle, color: 'text-indigo-400' }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Hero Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-4 h-4 bg-primary rounded-full"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-6 h-6 bg-accent rounded-full"
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-3 h-3 bg-web3-purple rounded-full"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.4, 0.9, 0.4]
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            className="hero-title"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div 
              className="mb-8 flex justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <img 
                src="/viragent-logo.svg" 
                alt="Viragent Logo" 
                className="w-24 h-24 md:w-32 md:h-32"
              />
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-space-grotesk font-bold mb-6">
              <span className="gradient-text">Viragent</span>
            </h1>
            <h2 className="text-2xl md:text-4xl font-space-grotesk font-medium mb-4">
              Web3-Native <span className="gradient-accent-text">AI Social Media</span> Automation
            </h2>
          </motion.div>

          <motion.p
            className="hero-subtitle text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            Automate your social media with AI-powered content generation, smart scheduling, 
            and viral prediction—all built on the secure Internet Computer blockchain.
          </motion.p>

          <motion.div 
            className="hero-buttons flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          >
            <Button variant="hero" size="xl" className="group" onClick={handleGetStarted}>
              {isAuthenticated ? 'Go to Dashboard' : 'Launch App'}
              <Rocket className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="glass" size="xl" className="group" onClick={handleWatchDemo}>
              <Play className="mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="flex flex-wrap justify-center gap-8 mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <div className="glass-card px-6 py-4">
              <div className="text-2xl font-bold gradient-text">10M+</div>
              <div className="text-sm text-muted-foreground">Posts Automated</div>
            </div>
            <div className="glass-card px-6 py-4">
              <div className="text-2xl font-bold gradient-accent-text">500+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="glass-card px-6 py-4">
              <div className="text-2xl font-bold text-success">95%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-space-grotesk font-bold mb-6">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to dominate social media with cutting-edge Web3 technology
            </p>
          </motion.div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card web3-card group cursor-pointer"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`w-12 h-12 rounded-lg bg-card mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-space-grotesk font-semibold mb-4 group-hover:gradient-text transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-medium text-muted-foreground mb-8">
              Powered by leading Web3 and AI technologies
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-12">
              {partners.map((partner, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <partner.icon className={`w-6 h-6 ${partner.color}`} />
                  <span className="font-medium">{partner.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        <div className="relative z-20 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative z-30"
          >
            <h2 className="text-5xl font-space-grotesk font-bold mb-6">
              Ready to go <span className="gradient-accent-text">viral</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join thousands of creators and brands already using Viragent to scale their social media presence.
            </p>
            <Button variant="hero" size="xl" className="group relative z-40" onClick={handleGetStarted}>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/viragent-logo.svg" 
                  alt="Viragent Logo" 
                  className="w-8 h-8"
                />
                <h3 className="text-2xl font-space-grotesk font-bold gradient-text">Viragent</h3>
              </div>
              <p className="text-muted-foreground max-w-md">
                The future of social media automation, powered by AI and secured by Web3 technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Features</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">API</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">About</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Blog</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy;  Viragent. Built on Internet Computer. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Video Demo Modal */}
      {showVideoDemo && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowVideoDemo(false)}
        >
          <motion.div
            className="relative w-full max-w-4xl mx-4 aspect-video"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <VideoPlayer
              src="/viragenVid.mp4"
              autoplay={true}
              muted={false}
              loop={false}
              className="w-full h-full"
            />
            
            {/* Close Button */}
            <button
              onClick={() => setShowVideoDemo(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Landing;