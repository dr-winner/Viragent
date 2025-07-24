import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backendService } from '../services/backend';
import { useAuth } from '../contexts/AuthContext';
import { 
  MediaItem, 
  ToneConfig, 
  ScheduledPost, 
  AIOutput, 
  EngagementData,
  SystemStats,
  HealthStatus 
} from '../types/backend';
import { useToast } from './use-toast';

// Hook to initialize backend service
export const useBackendInit = () => {
  const { identity, isAuthenticated } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['backend-init', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!identity) throw new Error('No identity available');
      
      await backendService.init(identity);
      
      // Try to initialize the backend and register user if needed
      const isRegistered = await backendService.isRegistered();
      if (isRegistered.success && !isRegistered.data) {
        // User not registered, we'll handle this in the registration flow
        return { initialized: true, needsRegistration: true };
      }
      
      return { initialized: true, needsRegistration: false };
    },
    enabled: isAuthenticated && !!identity,
    staleTime: Infinity, // Don't refetch automatically
    retry: 3,
    onError: (error) => {
      toast({
        title: "Backend Connection Error",
        description: "Failed to connect to the backend service. Please try again.",
        variant: "destructive"
      });
    }
  });
};

// User Management Hooks
export const useRegister = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => backendService.register(email),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Welcome to Viragent! You can now start using the platform.",
        });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        queryClient.invalidateQueries({ queryKey: ['backend-init'] });
      } else {
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => backendService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Media Management Hooks
export const useUploadMedia = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (media: MediaItem) => backendService.uploadMedia(media),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Media Uploaded",
          description: "Your media has been successfully uploaded.",
        });
        queryClient.invalidateQueries({ queryKey: ['user-media'] });
      } else {
        toast({
          title: "Upload Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  });
};

export const useUserMedia = () => {
  return useQuery({
    queryKey: ['user-media'],
    queryFn: () => backendService.getUserMedia(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpdateMediaStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      backendService.updateMediaStatus(id, status),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['user-media'] });
      } else {
        toast({
          title: "Update Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  });
};

// Tone Configuration Hooks
export const useSetTone = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tone: ToneConfig) => backendService.setTone(tone),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Tone Saved",
          description: "Your brand tone configuration has been saved.",
        });
        queryClient.invalidateQueries({ queryKey: ['tones'] });
      } else {
        toast({
          title: "Save Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  });
};

export const useAllTones = () => {
  return useQuery({
    queryKey: ['tones'],
    queryFn: () => backendService.getAllTones(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// AI Content Generation Hooks
export const useGenerateAIContent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mediaId, prompt, tone, platform }: { 
      mediaId: string; 
      prompt: string; 
      tone: string; 
      platform: string 
    }) => backendService.generateAIContent(mediaId, prompt, tone, platform),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast({
          title: "AI Content Generated",
          description: "AI has generated content for your media.",
        });
        queryClient.invalidateQueries({ queryKey: ['ai-output', variables.mediaId] });
        queryClient.invalidateQueries({ queryKey: ['user-media'] });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI content. Please try again.",
        variant: "destructive"
      });
    }
  });
};

export const useGenerateSmartContent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mediaId, prompt }: { mediaId: string; prompt: string }) => 
      backendService.generateSmartContent(mediaId, prompt),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast({
          title: "Smart Content Generated",
          description: "AI has generated optimized content for your media.",
        });
        queryClient.invalidateQueries({ queryKey: ['ai-output', variables.mediaId] });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  });
};

export const useGenerateOutput = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (output: AIOutput) => backendService.generateOutput(output),
    onSuccess: (result, variables) => {
      if (result.success) {
        toast({
          title: "AI Content Generated",
          description: "AI has generated content for your media.",
        });
        queryClient.invalidateQueries({ queryKey: ['ai-output', variables.mediaId] });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  });
};

export const useAIOutput = (mediaId: string) => {
  return useQuery({
    queryKey: ['ai-output', mediaId],
    queryFn: () => backendService.getOutput(mediaId),
    enabled: !!mediaId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Scheduling Hooks
export const useSchedulePost = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: ScheduledPost) => backendService.schedulePost(post),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Post Scheduled",
          description: "Your post has been scheduled successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
      } else {
        toast({
          title: "Scheduling Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  });
};

export const useScheduledPosts = () => {
  return useQuery({
    queryKey: ['scheduled-posts'],
    queryFn: () => backendService.getScheduledPosts(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCancelPost = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => backendService.cancelPost(postId),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Post Cancelled",
          description: "Your scheduled post has been cancelled.",
        });
        queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
      } else {
        toast({
          title: "Cancellation Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  });
};

// Analytics Hooks
export const useAddMetrics = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: EngagementData }) => 
      backendService.addMetrics(postId, data),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['metrics', variables.postId] });
      } else {
        toast({
          title: "Metrics Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  });
};

export const useMetrics = (postId: string) => {
  return useQuery({
    queryKey: ['metrics', postId],
    queryFn: () => backendService.getMetrics(postId),
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// System Hooks
export const useSystemStats = () => {
  return useQuery({
    queryKey: ['system-stats'],
    queryFn: () => backendService.getSystemStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => backendService.getHealth(),
    refetchInterval: 30 * 1000, // Check every 30 seconds
    staleTime: 0, // Always fresh
  });
};

// Simple hook to get the backend service instance
export const useBackend = () => {
  const { identity } = useAuth();
  
  return {
    service: backendService,
    isReady: !!identity
  };
};
