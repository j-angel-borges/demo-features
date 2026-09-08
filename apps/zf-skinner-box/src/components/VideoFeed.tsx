import React, { useRef, useCallback, useState, useEffect } from 'react';
import type { SkinnerVideoItem } from '../types/skinner.types.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { hapticEngine } from '../engines/hapticEngine.js';

interface VideoFeedProps {
  currentItem: SkinnerVideoItem;
  onScrollTrigger: () => void;
  showDopamineFlash: boolean;
  isMuted?: boolean;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  currentItem,
  onScrollTrigger,
  showDopamineFlash,
  isMuted = false,
}) => {
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);

  // Double-tap to heart animation (TikTok native effect)
  const handleTapOrDoubleTap = (clientX: number, clientY: number, targetElement: HTMLElement) => {
    const now = performance.now();
    const timesince = now - lastTapTimeRef.current;

    if (timesince < 300) {
      // Double Tap Detected!
      const rect = targetElement.getBoundingClientRect();
      const heartX = clientX - rect.left;
      const heartY = clientY - rect.top;
      const newHeart: FloatingHeart = {
        id: Date.now() + Math.random(),
        x: heartX,
        y: heartY,
      };

      setHearts((prev) => [...prev, newHeart]);
      hapticEngine.playTapHeart();

      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 1000);

      lastTapTimeRef.current = 0;
    } else {
      lastTapTimeRef.current = now;
    }
  };

  // Handle touch swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = performance.now();
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartY.current === null) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY;
      const duration = performance.now() - touchStartTime.current;

      // Upward swipe of at least 35px or quick flick
      if (deltaY > 35 || (deltaY > 15 && duration < 250)) {
        onScrollTrigger();
      } else if (Math.abs(deltaY) < 10) {
        // Tap or double tap
        const touch = e.changedTouches[0];
        handleTapOrDoubleTap(touch.clientX, touch.clientY, e.currentTarget as HTMLElement);
      }

      touchStartY.current = null;
    },
    [onScrollTrigger]
  );

  // Handle mouse click double-tap for desktop testing
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleTapOrDoubleTap(e.clientX, e.clientY, e.currentTarget);
  };

  // Handle mouse wheel gestures
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.deltaY > 25) {
        onScrollTrigger();
      }
    },
    [onScrollTrigger]
  );

  // Ensure video element plays smoothly and immediately on video change
  useEffect(() => {
    setIsVideoLoaded(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsVideoLoaded(true))
          .catch(() => {
            // If browser autoplay policy blocked with sound, fallback to muted immediately
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current
                .play()
                .then(() => setIsVideoLoaded(true))
                .catch(() => {});
            }
          });
      }
    }
  }, [currentItem.videoUrl, isMuted]);

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-black select-none touch-pan-y flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      onWheel={handleWheel}
    >
      <AnimatePresence>
        <motion.div
          key={currentItem.id || currentItem.videoUrl}
          initial={{ y: 50, opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0.8 }}
          transition={{ type: 'spring', damping: 28, stiffness: 360, mass: 0.6 }}
          className="w-full h-full relative bg-slate-950 flex items-center justify-center overflow-hidden"
        >
          {/* Native Vertical 9:16 Video Player */}
          {currentItem.videoUrl ? (
            <video
              ref={videoRef}
              key={currentItem.videoUrl}
              src={currentItem.videoUrl}
              poster={currentItem.posterUrl}
              preload="auto"
              autoPlay
              playsInline
              loop
              muted={isMuted}
              onLoadedData={() => setIsVideoLoaded(true)}
              onCanPlay={() => setIsVideoLoaded(true)}
              onPlaying={() => setIsVideoLoaded(true)}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-b from-slate-900 to-black flex items-center justify-center text-white/50 text-sm">
              Cargando video...
            </div>
          )}

          {/* Instant poster background during initial frame decode */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-200 pointer-events-none ${
              isVideoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              backgroundImage: currentItem.posterUrl ? `url(${currentItem.posterUrl})` : undefined,
              backgroundColor: '#090D16',
            }}
          />

          {/* Dopamine Flash Overlay */}
          {showDopamineFlash && <div className="zentry-dopamine-overlay" />}
        </motion.div>
      </AnimatePresence>

      {/* Floating Heart Bursts from Double-Tap */}
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ opacity: 1, scale: 0, y: 0, rotate: (Math.random() - 0.5) * 30 }}
          animate={{ opacity: 0, scale: 2.2, y: -80, rotate: (Math.random() - 0.5) * 45 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ left: h.x - 32, top: h.y - 32 }}
          className="absolute pointer-events-none z-40 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.9)]"
        >
          <Heart className="w-16 h-16 fill-current" />
        </motion.div>
      ))}
    </div>
  );
};
