import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar as CalendarIcon,
  Clock,
  Twitter,
  Instagram,
  Linkedin,
  Share2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Pause,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useSchedulePost, useScheduledPosts, useCancelPost, useBackendInit } from "@/hooks/useBackend";
import { ScheduledPost } from "@/types/backend";

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'instagram']);
  const [selectedTime, setSelectedTime] = useState('14:00');
  const { toast } = useToast();
  
  // Use React Query hooks for backend operations
  const schedulePostMutation = useSchedulePost();
  const scheduledPostsQuery = useScheduledPosts();
  const cancelPostMutation = useCancelPost();
  const backendInit = useBackendInit();

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2', followers: '12.5K' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', followers: '8.9K' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0077B5', followers: '5.2K' },
    { id: 'tiktok', name: 'TikTok', icon: Play, color: '#FF0050', followers: '15.1K' }
  ];

  // Demo data - in real app this would come from scheduledPostsQuery.data
  const demoScheduledPosts = [
    {
      id: 1,
      content: "🚀 Exciting announcement coming tomorrow! Stay tuned for something revolutionary in the AI space. #AI #Innovation",
      platforms: ['twitter', 'linkedin'],
      scheduledTime: '2024-01-15T14:00:00',
      status: 'scheduled',
      viralScore: 8.2,
      estimatedReach: '12.5K'
    },
    {
      id: 2,
      content: "Behind the scenes: How we built our AI-powered social media automation platform ✨ Thread below 👇",
      platforms: ['twitter'],
      scheduledTime: '2024-01-15T16:30:00',
      status: 'published',
      viralScore: 7.8,
      actualReach: '18.2K',
      engagement: { likes: 342, shares: 67, comments: 89 }
    },
    {
      id: 3,
      content: "New blog post: The Future of Social Media Automation 📝 Link in bio! #BlogPost #SocialMedia",
      platforms: ['instagram', 'linkedin'],
      scheduledTime: '2024-01-15T18:00:00',
      status: 'failed',
      viralScore: 6.5,
      error: 'Authentication expired'
    }
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4 text-accent" />;
      case 'published': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-accent text-accent-foreground';
      case 'published': return 'bg-success text-success-foreground';
      case 'failed': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform ? <platform.icon className="h-4 w-4" style={{ color: platform.color }} /> : null;
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSchedulePost = async () => {
    try {
      if (!selectedDate || selectedPlatforms.length === 0) {
        toast({ 
          title: "Missing info", 
          description: "Select date, time, and at least one platform.", 
          variant: "destructive" 
        });
        return;
      }
      
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(Number(selectedTime.split(":")[0]), Number(selectedTime.split(":")[1]));
      
      // Schedule posts for each selected platform
      for (const platform of selectedPlatforms) {
        const postData: ScheduledPost = {
          id: `${Date.now()}_${platform}`,
          mediaId: 'demo-media-id', // In real app, this would come from actual media
          platform,
          scheduledAt: scheduledAt.getTime(),
          status: 'scheduled'
        };
        
        await schedulePostMutation.mutateAsync(postData);
      }
      
      toast({ 
        title: "Success", 
        description: `Scheduled ${selectedPlatforms.length} post(s) for ${scheduledAt.toLocaleDateString()}` 
      });
      
      // Refresh scheduled posts
      scheduledPostsQuery.refetch();
      
    } catch (err) {
      toast({ 
        title: "Error", 
        description: "Failed to schedule posts. Please try again.", 
        variant: "destructive" 
      });
    }
  };  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-space-grotesk font-bold mb-2">
            Schedule Posts
          </h1>
          <p className="text-muted-foreground">
            Plan and schedule your content across multiple platforms
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Scheduling Interface */}
          <div className="xl:col-span-1 space-y-6">
            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="web3-card">
                <h3 className="text-lg font-space-grotesk font-semibold mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Select Date
                </h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-0 w-full"
                />
              </Card>
            </motion.div>

            {/* Time Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="web3-card">
                <h3 className="text-lg font-space-grotesk font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Select Time
                </h3>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="web3-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>
            </motion.div>

            {/* Platform Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="web3-card">
                <h3 className="text-lg font-space-grotesk font-semibold mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-web3-purple" />
                  Select Platforms
                </h3>
                
                <div className="space-y-3">
                  {platforms.map((platform) => (
                    <motion.div
                      key={platform.id}
                      className={`
                        p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                        ${selectedPlatforms.includes(platform.id)
                          ? 'border-primary bg-primary/10 neon-border'
                          : 'border-border hover:border-primary/50 hover:bg-card/80'
                        }
                      `}
                      onClick={() => togglePlatform(platform.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <platform.icon 
                            className="h-5 w-5" 
                            style={{ color: platform.color }} 
                          />
                          <div>
                            <p className="font-medium">{platform.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {platform.followers} followers
                            </p>
                          </div>
                        </div>
                        {selectedPlatforms.includes(platform.id) && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3"
            >
              <Button 
                variant="web3" 
                size="lg" 
                className="w-full group"
                disabled={selectedPlatforms.length === 0 || !selectedDate || schedulePostMutation.isPending}
                onClick={handleSchedulePost}
              >
                {schedulePostMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Schedule Post
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full group"
                onClick={() => window.location.href = '/upload'}
              >
                <Share2 className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Create New Post
              </Button>
            </motion.div>
          </div>

          {/* Scheduled Posts List */}
          <div className="xl:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="web3-card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-space-grotesk font-semibold">
                    Scheduled Posts
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      Sort
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {demoScheduledPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      className="glass-card p-6 hover:bg-card/90 transition-all duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          {/* Post Header */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge className={getStatusColor(post.status)}>
                              {getStatusIcon(post.status)}
                              <span className="ml-1 capitalize">{post.status}</span>
                            </Badge>
                            
                            <div className="flex items-center gap-2">
                              {post.platforms.map((platformId) => (
                                <div key={platformId} className="flex items-center gap-1">
                                  {getPlatformIcon(platformId)}
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center gap-1 text-sm">
                              <TrendingUp className="h-3 w-3 text-accent" />
                              <span className="text-accent font-medium">
                                {post.viralScore}/10
                              </span>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              {formatDateTime(post.scheduledTime).date} at {formatDateTime(post.scheduledTime).time}
                            </div>
                          </div>

                          {/* Post Content */}
                          <p className="text-foreground/90 line-clamp-3">
                            {post.content}
                          </p>

                          {/* Post Stats */}
                          <div className="flex items-center gap-6 text-sm">
                            {post.status === 'published' && post.engagement ? (
                              <>
                                <span className="text-muted-foreground">
                                  Reach: <span className="text-foreground font-medium">{post.actualReach}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  Likes: <span className="text-foreground font-medium">{post.engagement.likes}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  Shares: <span className="text-foreground font-medium">{post.engagement.shares}</span>
                                </span>
                                <span className="text-muted-foreground">
                                  Comments: <span className="text-foreground font-medium">{post.engagement.comments}</span>
                                </span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">
                                Est. Reach: <span className="text-foreground font-medium">{post.estimatedReach}</span>
                              </span>
                            )}
                          </div>

                          {/* Error Message */}
                          {post.status === 'failed' && post.error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                              <p className="text-sm text-destructive">
                                ⚠️ {post.error}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="group">
                            <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </Button>
                          <Button variant="ghost" size="icon" className="group">
                            <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </Button>
                          <Button variant="ghost" size="icon" className="group">
                            <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </Button>
                          <Button variant="ghost" size="icon" className="group">
                            <MoreHorizontal className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Load More */}
                <div className="flex justify-center mt-6">
                  <Button variant="outline">
                    Load More Posts
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;