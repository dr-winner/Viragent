import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
}

export const VideoPlayer = ({ 
  src, 
  poster, 
  autoplay = false, 
  muted = true, 
  loop = true,
  className = "" 
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <motion.div 
      className={`relative group rounded-xl overflow-hidden shadow-2xl ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        playsInline
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Video Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Controls Overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
            onClick={toggleFullscreen}
          >
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
      
      {/* Play Button Overlay for Initial State */}
      {!isPlaying && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 border border-white/30">
            <Play className="h-12 w-12 text-white ml-1" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VideoPlayer;
