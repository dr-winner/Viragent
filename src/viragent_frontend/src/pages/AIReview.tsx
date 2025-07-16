import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Clock,
  RefreshCw,
  Copy,
  Edit,
  Check,
  Hash,
  Eye,
  Calendar,
  ArrowRight,
  Zap,
  Target,
  Share2
} from 'lucide-react';

const AIReview = () => {
  const [caption, setCaption] = useState(
    "🚀 Just launched our revolutionary AI-powered social media automation platform! Say goodbye to writer's block and hello to viral content. Our advanced algorithms analyze trending patterns to create posts that actually engage your audience. Ready to transform your social media game? #AI #SocialMedia #Innovation #WebDevelopment #TechStartup"
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const viralScore = 8.7;
  const engagementPrediction = {
    likes: 1240,
    shares: 89,
    comments: 156,
    reach: 12500
  };

  const suggestedHashtags = [
    { tag: '#AI', popularity: 'High', trending: true },
    { tag: '#SocialMedia', popularity: 'High', trending: false },
    { tag: '#Innovation', popularity: 'Medium', trending: true },
    { tag: '#WebDevelopment', popularity: 'Medium', trending: false },
    { tag: '#TechStartup', popularity: 'Medium', trending: false },
    { tag: '#Automation', popularity: 'Low', trending: true },
    { tag: '#DigitalMarketing', popularity: 'High', trending: false },
    { tag: '#ContentCreation', popularity: 'Medium', trending: true }
  ];

  const suggestedTimes = [
    { platform: 'Twitter', time: '2:00 PM', engagement: '92%', icon: '🐦' },
    { platform: 'Instagram', time: '6:00 PM', engagement: '87%', icon: '📷' },
    { platform: 'LinkedIn', time: '9:00 AM', engagement: '78%', icon: '💼' },
    { platform: 'TikTok', time: '7:00 PM', engagement: '95%', icon: '🎵' }
  ];

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      // Simulate new content generation
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-accent';
    return 'text-web3-purple';
  };

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case 'High': return 'bg-success text-success-foreground';
      case 'Medium': return 'bg-accent text-accent-foreground';
      case 'Low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-space-grotesk font-bold mb-2">
            AI Content Review
          </h1>
          <p className="text-muted-foreground">
            Review and refine your AI-generated content before scheduling
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-6">
            {/* Generated Caption */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="web3-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-space-grotesk font-semibold flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Generated Caption
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerate}
                      disabled={isRegenerating}
                      className="group"
                    >
                      {isRegenerating ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform" />
                      )}
                      Regenerate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="group"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 mr-2 text-success" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>

                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="web3-input min-h-32 text-base leading-relaxed resize-none"
                  placeholder="Your AI-generated caption will appear here..."
                />

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{caption.length} characters</span>
                    <span>•</span>
                    <span>{caption.split(' ').length} words</span>
                  </div>
                  <Button variant="ghost" size="sm" className="group">
                    <Edit className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Edit Mode
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Hashtag Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="web3-card">
                <h3 className="text-xl font-space-grotesk font-semibold mb-6 flex items-center gap-2">
                  <Hash className="h-5 w-5 text-accent" />
                  Hashtag Recommendations
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {suggestedHashtags.map((hashtag, index) => (
                    <motion.div
                      key={index}
                      className="glass-card p-3 hover:bg-card/90 transition-all duration-200 cursor-pointer group"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{hashtag.tag}</span>
                        {hashtag.trending && (
                          <TrendingUp className="h-3 w-3 text-success" />
                        )}
                      </div>
                      <Badge className={`text-xs ${getPopularityColor(hashtag.popularity)}`}>
                        {hashtag.popularity}
                      </Badge>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Mix high and medium popularity hashtags for optimal reach
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Optimal Posting Times */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="web3-card">
                <h3 className="text-xl font-space-grotesk font-semibold mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-web3-purple" />
                  Optimal Posting Times
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestedTimes.map((time, index) => (
                    <motion.div
                      key={index}
                      className="glass-card p-4 hover:bg-card/90 transition-all duration-200 cursor-pointer group"
                      whileHover={{ y: -2 }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{time.icon}</span>
                          <div>
                            <p className="font-medium">{time.platform}</p>
                            <p className="text-sm text-muted-foreground">{time.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-success">{time.engagement}</p>
                          <p className="text-xs text-muted-foreground">engagement</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Viral Score */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="web3-card text-center">
                <h3 className="text-lg font-space-grotesk font-semibold mb-4 flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Viral Score
                </h3>
                
                <div className="relative mb-4">
                  <div className="w-24 h-24 mx-auto rounded-full border-4 border-muted flex items-center justify-center bg-gradient-primary">
                    <span className={`text-2xl font-bold ${getViralScoreColor(viralScore)}`}>
                      {viralScore}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground">
                      /10
                    </Badge>
                  </div>
                </div>

                <Progress value={viralScore * 10} className="mb-4" />
                
                <p className="text-sm text-muted-foreground">
                  High potential for viral engagement
                </p>
              </Card>
            </motion.div>

            {/* Engagement Prediction */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="web3-card">
                <h3 className="text-lg font-space-grotesk font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Predicted Engagement
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Likes</span>
                    <span className="font-medium">{engagementPrediction.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Shares</span>
                    <span className="font-medium">{engagementPrediction.shares}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Comments</span>
                    <span className="font-medium">{engagementPrediction.comments}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-primary">Est. Reach</span>
                    <span className="text-primary">{engagementPrediction.reach.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="web3-card">
                <h3 className="text-lg font-space-grotesk font-semibold mb-4">
                  Quick Actions
                </h3>

                <div className="space-y-3">
                  <Button variant="glass" className="w-full justify-start group">
                    <Eye className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Preview Post
                  </Button>
                  <Button variant="glass" className="w-full justify-start group">
                    <Share2 className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Share for Review
                  </Button>
                  <Button variant="glass" className="w-full justify-start group">
                    <Sparkles className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Alternative Versions
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Schedule Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button variant="web3" size="lg" className="w-full group">
                <Calendar className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Schedule Posts
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReview;