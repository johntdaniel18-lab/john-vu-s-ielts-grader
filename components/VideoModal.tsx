
import React, { useEffect } from 'react';

interface VideoModalProps {
  videoId: string;
  platform?: 'youtube' | 'vimeo';
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ videoId, platform = 'vimeo', onClose }) => {
  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const embedUrl = platform === 'vimeo'
    ? `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`
    : `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  const fallbackLink = platform === 'vimeo'
    ? `https://vimeo.com/${videoId}`
    : `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-5xl flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            {/* Close Button */}
            <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white/80 rounded-full hover:bg-white/20 hover:text-white transition-all backdrop-blur-md group"
            title="Close Video"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>

            {/* Video Container (16:9 Aspect Ratio) */}
            <div className="relative pt-[56.25%] bg-black">
            <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={embedUrl}
                title={`${platform === 'vimeo' ? 'Vimeo' : 'YouTube'} video player`}
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                allowFullScreen
            ></iframe>
            </div>
        </div>

        {/* Fallback Link */}
        <div className="mt-4 text-center">
             <a 
                href={fallbackLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
             >
                Trouble playing? Watch on {platform === 'vimeo' ? 'Vimeo' : 'YouTube'}
             </a>
        </div>
      </div>
    </div>
  );
};
