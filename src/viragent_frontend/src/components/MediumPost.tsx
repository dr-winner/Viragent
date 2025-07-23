import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Send, Eye, FileText, X, Hash, Clock, Target, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediumPostProps {
  onPost?: (postData: any) => void;
  initialContent?: string;
  initialTitle?: string;
}

export function MediumPost({ onPost, initialContent = '', initialTitle = '' }: MediumPostProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'public' | 'unlisted'>('draft');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  // Engagement prediction based on content
  const getEngagementPrediction = () => {
    const wordCount = content.split(' ').length;
    const hasTitle = title.trim().length > 0;
    const hasHashtags = tags.length > 0;
    
    let score = 6.5; // Base score
    if (wordCount > 500) score += 1.5;
    if (hasTitle) score += 0.5;
    if (hasHashtags) score += 0.8;
    if (publishStatus === 'public') score += 0.7;
    
    return Math.min(score, 10);
  };

  const addTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for your Medium article.",
        variant: "destructive",
      });
      return;
    }

    const accessToken = localStorage.getItem('medium_access_token');
    if (!accessToken) {
      toast({
        title: "Not Connected",
        description: "Please connect your Medium account first.",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);

    try {
      const postData = {
        title,
        content,
        publishStatus,
        tags,
        platform: 'medium'
      };

      if (onPost) {
        await onPost(postData);
      }

      toast({
        title: "Article Posted!",
        description: `Your article "${title}" has been ${publishStatus === 'draft' ? 'saved as draft' : 'published'} to Medium.`,
      });

      // Reset form
      setTitle('');
      setContent('');
      setTags([]);
      setPublishStatus('draft');

    } catch (error) {
      toast({
        title: "Posting Failed",
        description: "Failed to post to Medium. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const engagementScore = getEngagementPrediction();
  const wordCount = content.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="web3-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-space-grotesk font-semibold">Create Medium Article</h2>
                <p className="text-muted-foreground">Craft compelling long-form content for your audience</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Label htmlFor="title" className="text-base font-medium">Article Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your compelling article title..."
                  className="web3-input text-lg h-12"
                />
              </motion.div>

              {/* Content */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="content" className="text-base font-medium">Article Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article content here... You can use HTML formatting for rich text."
                  className="web3-input min-h-[400px] resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{content.length} characters • {wordCount} words</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{readingTime} min read
                  </span>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                  💡 Tip: Medium supports HTML formatting. Use tags like &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;blockquote&gt; for rich formatting.
                </p>
              </motion.div>

              {/* Tags */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label className="text-base font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4 text-accent" />
                  Tags (up to 5)
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a relevant tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    disabled={tags.length >= 5}
                    className="web3-input"
                  />
                  <Button 
                    onClick={addTag} 
                    variant="glass" 
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="px-6"
                  >
                    Add
                  </Button>
                </div>
                
                {tags.length > 0 && (
                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {tags.map((tag, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Publish Status */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label className="text-base font-medium">Publication Status</Label>
                <Select value={publishStatus} onValueChange={(value: any) => setPublishStatus(value)}>
                  <SelectTrigger className="web3-input w-[250px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Save as Draft</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>Publish Public</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="unlisted">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 opacity-50" />
                        <span>Unlisted</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
                  {publishStatus === 'draft' && "📝 Save as draft - only you can see it until published"}
                  {publishStatus === 'public' && "🌍 Publish publicly - visible to all Medium readers"}
                  {publishStatus === 'unlisted' && "🔗 Unlisted - only people with the direct link can access it"}
                </div>
              </motion.div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Engagement Prediction */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="web3-card text-center">
              <h3 className="text-lg font-space-grotesk font-semibold mb-4 flex items-center justify-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Engagement Score
              </h3>
              
              <div className="relative mb-4">
                <div className="w-20 h-20 mx-auto rounded-full border-4 border-muted bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-success">
                    {engagementScore.toFixed(1)}
                  </span>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                  <Badge className="bg-success/20 text-success">
                    /10
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {engagementScore >= 8 ? "High engagement potential" : 
                 engagementScore >= 6 ? "Good engagement potential" : 
                 "Consider adding more content"}
              </p>
            </Card>
          </motion.div>

          {/* Article Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="web3-card">
              <h3 className="text-lg font-space-grotesk font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent" />
                Article Analytics
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Word Count</span>
                  <span className="font-medium">{wordCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reading Time</span>
                  <span className="font-medium">{readingTime} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tags Used</span>
                  <span className="font-medium">{tags.length}/5</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={publishStatus === 'public' ? 'default' : 'secondary'}>
                    {publishStatus}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="web3-card">
              <h3 className="text-lg font-space-grotesk font-semibold mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <Button 
                  variant="glass" 
                  className="w-full justify-start group"
                  onClick={() => {
                    setTitle('');
                    setContent('');
                    setTags([]);
                    setPublishStatus('draft');
                  }}
                >
                  <FileText className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Clear All
                </Button>
                <Button variant="glass" className="w-full justify-start group">
                  <Eye className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Preview Article
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Publish Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              onClick={handlePost} 
              disabled={isPosting || !title.trim() || !content.trim()}
              variant="web3"
              size="lg" 
              className="w-full group"
            >
              {isPosting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  {publishStatus === 'draft' ? 'Save Draft' : 'Publish Article'}
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
