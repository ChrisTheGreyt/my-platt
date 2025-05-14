import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  className?: string;
  autoplay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  posterUrl, 
  className = '',
  autoplay = false 
}) => {
  // Check if the URL is a YouTube URL
  const isYouTubeUrl = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  if (isYouTubeUrl) {
    // Extract video ID from YouTube URL
    const getYouTubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeId(videoUrl);
    
    if (!videoId) {
      return <div>Invalid YouTube URL</div>;
    }

    return (
      <div className={`relative w-full ${className}`}>
        <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-2xl">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}`}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // Handle S3 or other direct video URLs
  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-2xl">
        <video 
          controls
          controlsList="nodownload"
          className="absolute top-0 left-0 w-full h-full"
          poster={posterUrl}
          autoPlay={autoplay}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoPlayer; 