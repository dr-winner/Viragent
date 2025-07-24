import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useGenerateAIContent, useUploadMedia, useBackendInit } from '@/hooks/useBackend';
import { MediaItem } from '@/types/backend';
import {
  Upload as UploadIcon,
  Image,
  Video,
  Music,
  X,
  CheckCircle,
  Loader2,
  Sparkles,
  Target,
  Zap,
  Brain,
  Eye,
  ArrowRight
} from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const generateAIContent = useGenerateAIContent();
  const uploadMedia = useUploadMedia();
  const backendInit = useBackendInit();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedMediaIds, setUploadedMediaIds] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [toneSettings, setToneSettings] = useState({
    creativity: [7],
    professionalism: [5],
    humor: [6],
    urgency: [4],
    inclusivity: [8]
  });
  const [selectedTonePreset, setSelectedTonePreset] = useState('balanced');

  const tonePresets = [
    { id: 'professional', name: 'Professional', icon: '💼', description: 'Formal and authoritative' },
    { id: 'casual', name: 'Casual', icon: '😊', description: 'Friendly and approachable' },
    { id: 'funny', name: 'Funny', icon: '😄', description: 'Humorous and entertaining' },
    { id: 'urgent', name: 'Urgent', icon: '🚨', description: 'Direct and action-oriented' },
    { id: 'inspiring', name: 'Inspiring', icon: '✨', description: 'Motivational and uplifting' },
    { id: 'balanced', name: 'Balanced', icon: '⚖️', description: 'Perfect mix of all tones' }
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = async (files: FileList) => {
    const newFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') || 
      file.type.startsWith('video/') || 
      file.type.startsWith('audio/')
    );
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Upload files to backend
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadPromises = newFiles.map(async (file, index) => {
        const mediaItem: MediaItem = {
          id: `media_${Date.now()}_${index}`,
          owner: '', // Will be set by backend
          url: URL.createObjectURL(file), // Temporary URL for preview
          mediaType: file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('video/') ? 'video' : 'audio',
          status: 'uploaded',
          createdAt: Date.now(),
        };
        
        const result = await uploadMedia.mutateAsync(mediaItem);
        if (result.success) {
          return mediaItem.id;
        }
        throw new Error(result.error || 'Upload failed');
      });
      
      const mediaIds = await Promise.all(uploadPromises);
      setUploadedMediaIds(prev => [...prev, ...mediaIds]);
      setUploadProgress(100);
      
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${newFiles.length} file(s)`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload some files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (file.type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (file.type.startsWith('audio/')) return <Music className="h-5 w-5" />;
    return <UploadIcon className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const applyTonePreset = (presetId: string) => {
    setSelectedTonePreset(presetId);
    
    const presetSettings = {
      professional: { creativity: [4], professionalism: [9], humor: [2], urgency: [6], inclusivity: [7] },
      casual: { creativity: [6], professionalism: [3], humor: [7], urgency: [4], inclusivity: [8] },
      funny: { creativity: [9], professionalism: [2], humor: [10], urgency: [3], inclusivity: [6] },
      urgent: { creativity: [5], professionalism: [8], humor: [2], urgency: [10], inclusivity: [6] },
      inspiring: { creativity: [8], professionalism: [6], humor: [5], urgency: [7], inclusivity: [9] },
      balanced: { creativity: [7], professionalism: [5], humor: [6], urgency: [4], inclusivity: [8] }
    };
    
    setToneSettings(presetSettings[presetId as keyof typeof presetSettings] || presetSettings.balanced);
  };

  const handleGenerateAIContent = async () => {
    if (uploadedMediaIds.length === 0 && uploadedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload media files first",
        variant: "destructive",
      });
      return;
    }

    // Use the first uploaded media ID or create a temporary one
    const mediaId = uploadedMediaIds.length > 0 ? uploadedMediaIds[0] : `temp_${Date.now()}`;
    
    // Create prompt based on tone settings and uploaded files
    const toneDescription = `Creativity: ${toneSettings.creativity[0]}/10, Professionalism: ${toneSettings.professionalism[0]}/10, Humor: ${toneSettings.humor[0]}/10, Urgency: ${toneSettings.urgency[0]}/10, Inclusivity: ${toneSettings.inclusivity[0]}/10`;
    const prompt = `Generate social media content for uploaded media with tone settings: ${toneDescription}. Selected preset: ${selectedTonePreset}. Create engaging content that matches these tone preferences.`;
    
    try {
      await generateAIContent.mutateAsync({
        mediaId,
        prompt,
        tone: selectedTonePreset,
        platform: "multi-platform"
      });
      
      // Navigate to AI Review page after successful generation
      navigate('/ai-review', { 
        state: { 
          mediaId, 
          generatedContent: true 
        } 
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error('Error generating AI content:', error);
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
            Upload & Tone Setup
          </h1>
          <p className="text-muted-foreground">
            Upload your media and configure AI tone for perfect content generation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="web3-card">
              <h2 className="text-2xl font-space-grotesk font-semibold mb-6">
                Media Upload
              </h2>

              {/* Drag & Drop Zone */}
              <div
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                  ${dragActive 
                    ? 'border-primary bg-primary/10 scale-105' 
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <motion.div
                  className="space-y-4"
                  animate={{ scale: dragActive ? 1.05 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <UploadIcon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drop your files here, or <span className="text-primary">browse</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports images, videos, and audio files up to 50MB
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm">Uploading files...</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </motion.div>
              )}

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <motion.div
                  className="mt-6 space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-between p-3 bg-card rounded-lg border"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(file)}
                          <div>
                            <p className="text-sm font-medium truncate max-w-40">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Tone Configuration */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="web3-card">
              <h2 className="text-2xl font-space-grotesk font-semibold mb-6">
                AI Tone Configuration
              </h2>

              {/* Tone Presets */}
              <div className="space-y-4 mb-6">
                <Label className="text-base font-medium">Quick Presets</Label>
                <div className="grid grid-cols-2 gap-3">
                  {tonePresets.map((preset) => (
                    <motion.button
                      key={preset.id}
                      onClick={() => applyTonePreset(preset.id)}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all duration-200
                        ${selectedTonePreset === preset.id
                          ? 'border-primary bg-primary/10 neon-border'
                          : 'border-border hover:border-primary/50 hover:bg-card/80'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{preset.icon}</span>
                        <span className="font-medium">{preset.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {preset.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Custom Tone Sliders */}
              <div className="space-y-6 mt-6">
                <Label className="text-base font-medium">Custom Adjustments</Label>
                
                {Object.entries(toneSettings).map(([key, value]) => (
                  <motion.div
                    key={key}
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Object.keys(toneSettings).indexOf(key) * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <Label className="capitalize flex items-center gap-2">
                        {key === 'creativity' && <Sparkles className="h-4 w-4 text-primary" />}
                        {key === 'professionalism' && <Target className="h-4 w-4 text-accent" />}
                        {key === 'humor' && <span className="text-sm">😄</span>}
                        {key === 'urgency' && <Zap className="h-4 w-4 text-web3-purple" />}
                        {key === 'inclusivity' && <span className="text-sm">🤝</span>}
                        {key.replace(/([A-Z])/g, ' $1')}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {value[0]}/10
                      </Badge>
                    </div>
                    <Slider
                      value={value}
                      onValueChange={(newValue) => 
                        setToneSettings(prev => ({ ...prev, [key]: newValue }))
                      }
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Tone Preview */}
              <motion.div
                className="mt-8 p-4 bg-muted/50 rounded-lg border"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-accent" />
                  <Label className="font-medium">Tone Preview</Label>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "🚀 Exciting news! Our latest AI-powered feature is now live and ready to transform your social media game. Don't miss out on this incredible opportunity to boost your engagement! #Innovation #AI #SocialMedia"
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Generated with current tone settings
                  </span>
                </div>
              </motion.div>
            </Card>

            {/* Generate Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="web3"
                size="lg"
                className="w-full group"
                disabled={uploadedFiles.length === 0 || generateAIContent.isPending}
                onClick={handleGenerateAIContent}
              >
                {generateAIContent.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                    Generate AI Content
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Upload;