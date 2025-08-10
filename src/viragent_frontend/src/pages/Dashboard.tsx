import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Users,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Plus,
  Zap,
  Target,
  Clock
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { HttpAgent, Actor } from "@dfinity/agent";
import { idlFactory as backendIdl, canisterId as backendCanisterId } from "../../../declarations/viragent_backend";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [tweetContent, setTweetContent] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setTwitterConnected(!!localStorage.getItem("twitter_access_token"));
  }, []);

  const handleConnectTwitter = () => {
    navigate("/auth/twitter");
  };

  const handleQuickTweet = async () => {
    try {
      const accessToken = localStorage.getItem("twitter_access_token");
      if (!accessToken) {
        toast({ title: "Not connected", description: "Please connect to Twitter first.", variant: "destructive" });
        return;
      }
      const agent = new HttpAgent({ host: "http://localhost:4943" });
      const backend = Actor.createActor(backendIdl, {
        agent,
        canisterId: backendCanisterId,
      });
      const res = await backend.testTwitterPost(tweetContent, accessToken);
      if (res && res.toLowerCase().includes("success")) {
        toast({ title: "Success", description: "Tweet posted successfully!" });
        setTweetContent("");
      } else {
        toast({ title: "Error", description: res, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: String(err), variant: "destructive" });
    }
  };

  const engagementData = [
    { name: 'Mon', likes: 240, shares: 45, comments: 89 },
    { name: 'Tue', likes: 300, shares: 67, comments: 120 },
    { name: 'Wed', likes: 200, shares: 34, comments: 78 },
    { name: 'Thu', likes: 450, shares: 89, comments: 156 },
    { name: 'Fri', likes: 380, shares: 72, comments: 134 },
    { name: 'Sat', likes: 520, shares: 95, comments: 187 },
    { name: 'Sun', likes: 340, shares: 58, comments: 98 }
  ];

  const platformData = [
    { name: 'Twitter', value: 45, color: '#1DA1F2' },
    { name: 'Instagram', value: 30, color: '#E4405F' },
    { name: 'TikTok', value: 20, color: '#FF0050' },
    { name: 'LinkedIn', value: 5, color: '#0077B5' }
  ];

  const recentPosts = [
    {
      id: 1,
      content: 'Check out our latest Web3 integration! 🚀 #Web3 #AI #SocialMedia',
      platform: 'Twitter',
      status: 'published',
      engagement: { likes: 342, shares: 67, comments: 89 },
      viralScore: 8.5,
      publishedAt: '2 hours ago'
    },
    {
      id: 2,
      content: 'Behind the scenes of AI-powered content creation ✨',
      platform: 'Instagram',
      status: 'scheduled',
      scheduledFor: 'Today at 3:00 PM',
      viralScore: 7.2
    },
    {
      id: 3,
      content: 'The future of social media is here! Join the revolution 💫',
      platform: 'TikTok',
      status: 'draft',
      viralScore: 9.1
    }
  ];

  const stats = [
    {
      title: 'Total Reach',
      value: '124.5K',
      change: '+12.5%',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Engagement Rate',
      value: '8.4%',
      change: '+2.1%',
      icon: Heart,
      color: 'text-accent'
    },
    {
      title: 'Posts Published',
      value: '48',
      change: '+6',
      icon: Calendar,
      color: 'text-success'
    },
    {
      title: 'Viral Score Avg',
      value: '7.8',
      change: '+0.3',
      icon: TrendingUp,
      color: 'text-web3-purple'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-success text-success-foreground';
      case 'scheduled': return 'bg-accent text-accent-foreground';
      case 'draft': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Twitter': return '🐦';
      case 'Instagram': return '📷';
      case 'TikTok': return '🎵';
      case 'LinkedIn': return '💼';
      default: return '📱';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-4xl font-space-grotesk font-bold mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor your social media performance and AI insights
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="web3-input text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button variant="web3" className="group">
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
              New Post
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="web3-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-success mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-card ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Engagement Chart */}
          <motion.div
            className="xl:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="web3-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-space-grotesk font-semibold">
                  Engagement Trends
                </h3>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="likes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shares" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="comments" fill="hsl(var(--web3-purple))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Platform Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="web3-card">
              <h3 className="text-xl font-space-grotesk font-semibold mb-6">
                Platform Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {platformData.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: platform.color }}
                      />
                      <span className="text-sm">{platform.name}</span>
                    </div>
                    <span className="text-sm font-medium">{platform.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="web3-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-space-grotesk font-semibold">
                Recent Posts
              </h3>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  className="glass-card p-4 hover:bg-card/90 transition-all duration-200 cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                        <span className="font-medium">{post.platform}</span>
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-accent" />
                          <span className="text-sm font-medium text-accent">
                            {post.viralScore}/10
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-foreground/90">{post.content}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        {post.status === 'published' && post.engagement && (
                          <>
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.engagement.likes}
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="h-4 w-4" />
                              {post.engagement.shares}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4" />
                              {post.engagement.comments}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.publishedAt}
                            </div>
                          </>
                        )}
                        {post.status === 'scheduled' && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.scheduledFor}
                          </div>
                        )}
                        {post.status === 'draft' && (
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            Ready to schedule
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;