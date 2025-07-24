import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useGenerateAIContent, useAIOutput, useSchedulePost } from '@/hooks/useBackend';
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
  Share2,
  Loader2
} from 'lucide-react';

const AIReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const generateAIContent = useGenerateAIContent();
  const schedulePost = useSchedulePost();
  
  // Get mediaId from navigation state or use default
  const mediaId = location.state?.mediaId || 'demo-media-id';
  const aiOutput = useAIOutput(mediaId);
  
  const [caption, setCaption] = useState(
    "🚀 Just launched our revolutionary AI-powered social media automation platform! Say goodbye to writer's block and hello to viral content. Our advanced algorithms analyze trending patterns to create posts that actually engage your audience. Ready to transform your social media game? #AI #SocialMedia #Innovation #WebDevelopment #TechStartup"
  );
  const [copied, setCopied] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'instagram']);
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Update caption when AI output is loaded
  useEffect(() => {
    if (aiOutput.data && aiOutput.data.success && aiOutput.data.data) {
      setCaption(aiOutput.data.data.caption);
    }
  }, [aiOutput.data, aiOutput.dataUpdatedAt]); // Also listen to dataUpdatedAt for refetches

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

  const handleRegenerate = async () => {
    try {
      const result = await generateAIContent.mutateAsync({
        mediaId,
        prompt: "Regenerate content with improved engagement and creativity",
        tone: "balanced",
        platform: "multi-platform"
      });
      
      // The generateAIContent returns a string directly, not an object with caption
      if (result.success && result.data) {
        setCaption(result.data); // result.data is the generated text string
      }
      
      // The mutation already invalidates the query and shows toast, so we don't need to manually refetch
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Error regenerating content:', error);
    }
  };

  const handleSchedulePost = async () => {
    try {
      for (const platform of selectedPlatforms) {
        await schedulePost.mutateAsync({
          id: `${mediaId}_${platform}_${Date.now()}`,
          mediaId,
          platform,
          scheduledAt: selectedTime.getTime(),
          status: 'scheduled'
        });
      }
      
      toast({
        title: "Posts Scheduled",
        description: `Scheduled for ${selectedPlatforms.length} platform(s)`,
      });
      
      navigate('/schedule');
    } catch (error) {
      console.error('Error scheduling posts:', error);
    }
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-8"
        >
          <h1 className="text-4xl font-space-grotesk font-bold gradient-text">
            AI Content Review
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Review your AI-generated content, make adjustments, and schedule for optimal engagement
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                      disabled={generateAIContent.isPending}
                      className="group"
                    >
                      {generateAIContent.isPending ? (
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
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getPopularityColor(hashtag.popularity)}`}
                      >
                        {hashtag.popularity}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Viral Score */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="web3-card text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-space-grotesk font-semibold">Viral Score</h3>
                </div>
                
                <div className={`text-4xl font-bold mb-2 ${getViralScoreColor(viralScore)}`}>
                  {viralScore}
                </div>
                <p className="text-sm text-muted-foreground mb-4">out of 10</p>
                
                <Progress value={viralScore * 10} className="h-2 mb-4" />
                
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  High Engagement Potential
                </Badge>
              </Card>
            </motion.div>

            {/* Platform Selection & Scheduling */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="web3-card">
                <h3 className="text-lg font-space-grotesk font-semibold mb-3 flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-accent" />
                  Platform Selection
                </h3>

                <div className="space-y-2 mb-3">
                  {[
                    { id: 'twitter', name: 'Twitter', icon: '🐦' },
                    { id: 'instagram', name: 'Instagram', icon: '📷' },
                    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
                    { id: 'tiktok', name: 'TikTok', icon: '🎵' }
                  ].map((platform) => (
                    <div
                      key={platform.id}
                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedPlatforms(prev => 
                          prev.includes(platform.id)
                            ? prev.filter(id => id !== platform.id)
                            : [...prev, platform.id]
                        );
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{platform.icon}</span>
                        <span className="text-sm font-medium">{platform.name}</span>
                      </div>
                      {selectedPlatforms.includes(platform.id) && (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="glass" size="sm" className="text-xs">
                    <Eye className="mr-1 h-3 w-3" />
                    Preview
                  </Button>
                  <Button variant="glass" size="sm" className="text-xs">
                    <Share2 className="mr-1 h-3 w-3" />
                    Share
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Engagement Prediction */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="web3-card">
                <h3 className="text-lg font-space-grotesk font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Predicted Engagement
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Likes</span>
                    <span className="text-sm font-medium">{engagementPrediction.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Shares</span>
                    <span className="text-sm font-medium">{engagementPrediction.shares}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Comments</span>
                    <span className="text-sm font-medium">{engagementPrediction.comments}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-sm text-muted-foreground">Total Reach</span>
                    <span className="text-sm text-primary">{engagementPrediction.reach.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Schedule Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                variant="web3" 
                size="default" 
                className="w-full group"
                onClick={handleSchedulePost}
                disabled={selectedPlatforms.length === 0 || schedulePost.isPending}
              >
                {schedulePost.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Schedule Posts ({selectedPlatforms.length})
                    <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReview;
