"use client";
import React from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import { useSearchParams } from 'next/navigation';

const TestVideoPage = () => {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get('url');
  const posterUrl = searchParams.get('poster');
  const title = searchParams.get('title') || 'Video Player';

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto p-8">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 bg-white rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Video Player Test Page</h2>
              <p className="mb-4 text-gray-600">Add video URLs as query parameters to test different videos:</p>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 text-gray-700">For S3 videos:</h3>
                  <code className="block p-3 bg-gray-100 rounded text-sm break-all">
                    /test-video?url=https://your-s3-url.mp4&poster=thumbnail.jpg&title=Your Title
                  </code>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 text-gray-700">For YouTube videos:</h3>
                  <code className="block p-3 bg-gray-100 rounded text-sm break-all">
                    /test-video?url=https://youtube.com/watch?v=your-video-id&title=Your Title
                  </code>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">Try this example:</p>
                  <a 
                    href="/test-video?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&title=Example Video" 
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Test Example Video
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800 text-center">{title}</h1>
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
            <VideoPlayer 
              videoUrl={videoUrl}
              posterUrl={posterUrl || undefined}
              autoplay={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestVideoPage; 