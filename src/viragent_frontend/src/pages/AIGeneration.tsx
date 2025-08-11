import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { backendService } from '@/services/backend';
import {
  Brain,
  Sparkles,
  Loader2,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  ArrowRight,
  ArrowLeft,
  Zap,
  Target,
  RefreshCw,
  Copy,
  Check,
  Wand2
} from 'lucide-react';

const AIGeneration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // State management
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [tone, setTone] = useState('professional');
  const [mediaType, setMediaType] = useState('image');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get media ID from URL params if available
  const mediaId = searchParams.get('mediaId') || `media_${Date.now()}`;

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-400' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
  ];

  const tones = [
    { id: 'professional', name: 'Professional', desc: 'Formal and authoritative', icon: '💼' },
    { id: 'casual', name: 'Casual', desc: 'Friendly and approachable', icon: '😊' },
    { id: 'humorous', name: 'Humorous', desc: 'Funny and entertaining', icon: '😄' },
    { id: 'inspiring', name: 'Inspiring', desc: 'Motivational and uplifting', icon: '✨' },
  ];

  const mediaTypes = [
    { id: 'image', name: 'Image Post', desc: 'Single image with caption' },
    { id: 'video', name: 'Video Post', desc: 'Video content with description' },
    { id: 'carousel', name: 'Carousel', desc: 'Multiple images slideshow' },
    { id: 'story', name: 'Story', desc: 'Quick story format' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');

    try {
      // Use the new direct generation method that doesn't require media
      const result = await backendService.generateContentDirect(
        prompt,
        tone,
        platform
      );

      if (result.success) {
        // Parse the OpenAI response to extract just the content
        let content = result.data;
        try {
          // Try to parse as JSON if it's the full OpenAI response
          const jsonResponse = JSON.parse(content);
          if (jsonResponse.choices && jsonResponse.choices[0] && jsonResponse.choices[0].message) {
            content = jsonResponse.choices[0].message.content.trim();
          }
        } catch (e) {
          // If it's not JSON, use as is
          content = content.trim();
        }
        
        setGeneratedContent(content);
        toast({
          title: "Content Generated! ✨",
          description: "Your AI-powered content is ready for review.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "error" in result ? result.error : "Failed to generate content. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedToReview = () => {
    if (generatedContent) {
      // Pass the generated content to the review page
      navigate(`/ai-review?mediaId=${mediaId}&content=${encodeURIComponent(generatedContent)}&platform=${platform}&tone=${tone}`);
    }
  };

  const selectedPlatform = platforms.find(p => p.id === platform);
  const selectedTone = tones.find(t => t.id === tone);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-space-grotesk font-bold mb-2">
            AI Content Generation
          </h1>
          <p className="text-muted-foreground">
            Create engaging, viral-worthy content powered by AI
          </p>
        </motion.div>

        {/* Main Generation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="web3-card">
                <h2 className="text-xl font-space-grotesk font-semibold mb-6 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Content Description
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-2 flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-accent" />
                      Describe your content idea
                    </Label>
                    <Textarea
                      placeholder="e.g., A professional announcement about our new AI-powered social media tool that helps businesses create viral content automatically..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="web3-input min-h-32 text-base"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Be specific about your message, target audience, and key points
                    </p>
                  </div>

                  <Separator />

                  {/* Platform Selection */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Target Platform
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {platforms.map((p) => {
                        const Icon = p.icon;
                        return (
                          <motion.button
                            key={p.id}
                            onClick={() => setPlatform(p.id)}
                            className={`
                              p-4 rounded-xl border-2 text-left transition-all duration-200
                              ${platform === p.id
                                ? 'border-primary bg-primary/10 neon-border'
                                : 'border-border hover:border-primary/50'
                              }
                            `}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`h-5 w-5 ${p.color}`} />
                              <span className="font-medium">{p.name}</span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tone Selection */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Content Tone
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {tones.map((t) => (
                        <motion.button
                          key={t.id}
                          onClick={() => setTone(t.id)}
                          className={`
                            p-4 rounded-xl border-2 text-left transition-all duration-200
                            ${tone === t.id
                              ? 'border-accent bg-accent/10 neon-border'
                              : 'border-border hover:border-accent/50'
                            }
                          `}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-lg">{t.icon}</span>
                            <span className="font-medium">{t.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t.desc}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Media Type */}
                  <div>
                    <Label className="text-base font-medium mb-2 block">
                      Media Type
                    </Label>
                    <Select value={mediaType} onValueChange={setMediaType}>
                      <SelectTrigger className="web3-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mediaTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div>
                              <div className="font-medium">{type.name}</div>
                              <div className="text-xs text-muted-foreground">{type.desc}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Generated Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="web3-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-space-grotesk font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    Generated Content
                  </h2>
                  {generatedContent && (
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
                  )}
                </div>

                {isGenerating ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Generating your AI-powered content...
                      </p>
                    </div>
                  </div>
                ) : generatedContent ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-card border rounded-lg">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {generatedContent}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{generatedContent.length} characters</span>
                      <div className="flex items-center gap-2">
                        {selectedPlatform && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <selectedPlatform.icon className="h-3 w-3" />
                            {selectedPlatform.name}
                          </Badge>
                        )}
                        {selectedTone && (
                          <Badge variant="outline">
                            {selectedTone.icon} {selectedTone.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your AI-generated content will appear here</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Generation Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="web3-card">
                <h3 className="text-lg font-space-grotesk font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-web3-purple" />
                  Current Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Platform</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedPlatform && <selectedPlatform.icon className="h-4 w-4" />}
                      <span className="font-medium">{selectedPlatform?.name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Tone</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span>{selectedTone?.icon}</span>
                      <span className="font-medium">{selectedTone?.name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Media Type</Label>
                    <span className="block font-medium mt-1 capitalize">{mediaType}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="web3-card">
                <h3 className="text-lg font-space-grotesk font-semibold mb-4">
                  💡 Tips for Better Content
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-accent font-medium">Be Specific</p>
                    <p className="text-muted-foreground">
                      Include target audience, key benefits, and call-to-action
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-primary font-medium">Add Context</p>
                    <p className="text-muted-foreground">
                      Mention industry, product features, or current trends
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-web3-purple font-medium">Set Goals</p>
                    <p className="text-muted-foreground">
                      Specify if you want engagement, awareness, or conversions
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            variant="outline"
            onClick={() => navigate('/upload')}
            className="group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Upload
          </Button>

          <div className="flex items-center gap-4">
            <Button
              variant="glass"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="group"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </Button>

            <Button
              variant="web3"
              onClick={handleProceedToReview}
              disabled={!generatedContent}
              className="group"
            >
              Review & Schedule
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIGeneration;
