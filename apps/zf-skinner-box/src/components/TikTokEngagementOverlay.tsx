import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music2,
  CheckCircle2,
  Plus,
  Send,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { SkinnerVideoItem, VideoComment } from '../types/skinner.types.js';

interface TikTokEngagementOverlayProps {
  item: SkinnerVideoItem;
  activeRetentionPct: number;
  showJackpotBanner?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const TikTokEngagementOverlay: React.FC<TikTokEngagementOverlayProps> = ({
  item,
  activeRetentionPct,
  isMuted = false,
  onToggleMute,
}) => {
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesOffset, setLikesOffset] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>('');
  const [localComments, setLocalComments] = useState<VideoComment[]>(item.comments || []);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Format large numbers (e.g. 184200 -> "184.2K", 1200000 -> "1.2M")
  const formatCount = (count: number = 0) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      setLikesOffset((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikesOffset((prev) => prev + 1);
    }
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
  };

  const handleToggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1800);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: VideoComment = {
      id: `comm_${Date.now()}`,
      author: 'Tú',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      text: commentInput.trim(),
      likes: 1,
      timeAgo: 'ahora',
    };

    setLocalComments((prev) => [newComment, ...prev]);
    setCommentInput('');
  };

  const totalLikes = (item.likesCount || 120000) + likesOffset;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between select-none z-30">
      {/* Spacer for clean uncluttered video visibility */}
      <div className="flex-1 pointer-events-none" />

      {/* Bottom Interface Container with Dark Vignette Gradient */}
      <div className="relative w-full bg-linear-to-t from-black/90 via-black/50 to-transparent pt-12 pb-3 px-3 flex items-end justify-between gap-2 pointer-events-auto">
        
        {/* Left Side: Metadata & Audio Track (constrained width to never collide with action bar) */}
        <div className="flex-1 max-w-[calc(100%-72px)] space-y-1.5 pb-1">
          {/* Creator & Verified Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide hover:underline cursor-pointer">
              {item.creatorHandle || '@creador'}
            </span>
            {item.isVerifiedCreator && (
              <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400 drop-shadow" />
            )}
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-slate-950 tracking-wider shadow-sm"
              style={{ backgroundColor: item.accentColor }}
            >
              {item.topic}
            </span>
          </div>

          {/* Video Title */}
          <h2 className="text-xs sm:text-sm font-bold text-white/95 leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-2">
            {item.title}
          </h2>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-1.5">
            {item.hashtags?.map((tag) => (
              <span key={tag} className="text-[11px] font-extrabold text-sky-300 drop-shadow cursor-pointer">
                {tag}
              </span>
            ))}
          </div>

          {/* Music Audio Track Scrolling Marquee */}
          <div className="flex items-center gap-2 text-xs font-semibold text-white/90 drop-shadow pt-0.5">
            <Music2 className="w-3.5 h-3.5 text-white shrink-0 animate-pulse" />
            <div className="overflow-hidden whitespace-nowrap w-44">
              <div className="animate-marquee font-mono text-[10px]">
                {item.soundTitle || 'Sonido Original - Feed Zentry'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Action Bar (Likes, Comments, Bookmarks, Share, Audio, Vinyl) */}
        <div className="flex flex-col items-center gap-2.5 shrink-0 z-30 pb-1">
          {/* Creator Avatar & Follow Button */}
          <div className="relative mb-1">
            <div className="w-11 h-11 rounded-full p-0.5 bg-linear-to-tr from-pink-500 to-rose-500 shadow-xl overflow-hidden cursor-pointer">
              <img
                src={item.creatorAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                alt={item.creatorName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {!isFollowing && (
              <button
                onClick={handleToggleFollow}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4.5 h-4.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-125 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-3" />
              </button>
            )}
          </div>

          {/* Like Button */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={handleToggleLike}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-transform active:scale-125 cursor-pointer group"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLiked
                    ? 'fill-rose-500 text-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                    : 'text-white group-hover:text-rose-400'
                }`}
              />
            </button>
            <span className="text-[11px] font-black text-white drop-shadow font-mono">
              {formatCount(totalLikes)}
            </span>
          </div>

          {/* Comments Button */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(true);
              }}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-transform active:scale-125 cursor-pointer group"
            >
              <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <span className="text-[11px] font-black text-white drop-shadow font-mono">
              {formatCount(item.commentsCount || 1500)}
            </span>
          </div>

          {/* Bookmark Button */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={handleToggleBookmark}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-transform active:scale-125 cursor-pointer group"
            >
              <Bookmark
                className={`w-6 h-6 transition-colors ${
                  isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-white'
                }`}
              />
            </button>
            <span className="text-[11px] font-black text-white drop-shadow font-mono">
              {formatCount(item.bookmarksCount || 35000)}
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-transform active:scale-125 cursor-pointer group"
            >
              <Share2 className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <span className="text-[11px] font-black text-white drop-shadow font-mono">
              {copiedShare ? '¡Copiado!' : formatCount(item.sharesCount || 12000)}
            </span>
          </div>

          {/* Audio Sound Mute / Unmute Toggle Button */}
          {onToggleMute && (
            <div className="flex flex-col items-center gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMute();
                }}
                className={`p-2 rounded-full ${isMuted ? 'bg-rose-500/90' : 'bg-[#533B87]/90'} hover:opacity-90 backdrop-blur-md transition-transform active:scale-125 cursor-pointer shadow-lg border border-white/20`}
                title={isMuted ? 'Activar Sonido' : 'Silenciar Sonido'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white animate-pulse" />
                )}
              </button>
              <span className="text-[9px] font-bold text-white drop-shadow font-mono uppercase">
                {isMuted ? 'Mute' : 'Audio'}
              </span>
            </div>
          )}

          {/* Spinning Vinyl Record Icon */}
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ rotate: isMuted ? 0 : 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="w-9 h-9 rounded-full bg-slate-950 border-2 border-slate-700/80 p-0.5 flex items-center justify-center shadow-2xl cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleMute) onToggleMute();
              }}
            >
              <img
                src={item.creatorAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80'}
                alt="Sound"
                className="w-full h-full object-cover rounded-full"
              />
            </motion.div>
          </div>
        </div>

        {/* Ultra-Slim Bottom Video Scrubber Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_6px_rgba(255,255,255,0.8)]"
            style={{ width: `${activeRetentionPct}%` }}
          />
        </div>
      </div>

      {/* Interactive Comments Drawer / Sheet */}
      <AnimatePresence>
        {showComments && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fadeIn pointer-events-auto">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="w-full max-w-md bg-slate-900/98 text-white rounded-t-3xl border-t border-white/10 p-4 h-[60vh] flex flex-col justify-between shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {formatCount(item.commentsCount || 2300)} Comentarios
                </span>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
                {localComments.map((comm) => (
                  <div key={comm.id} className="flex items-start gap-3">
                    <img
                      src={comm.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                      alt={comm.author}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">{comm.author}</span>
                        <span className="text-[10px] text-slate-500">{comm.timeAgo}</span>
                      </div>
                      <p className="text-slate-100 mt-0.5 leading-relaxed">{comm.text}</p>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-slate-400">
                      <Heart className="w-3.5 h-3.5 hover:text-rose-500 cursor-pointer" />
                      <span className="text-[10px]">{comm.likes}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Añadir comentario..."
                  className="flex-1 bg-white/10 text-white placeholder-slate-400 text-xs rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#533B87] border border-white/10"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="p-2.5 rounded-full bg-[#533B87] hover:bg-[#684ca3] text-white disabled:opacity-40 disabled:hover:bg-[#533B87] transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
