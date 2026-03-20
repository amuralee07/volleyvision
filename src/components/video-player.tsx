"use client";

import { useRef, useImperativeHandle, forwardRef } from "react";

export interface VideoPlayerHandle {
  seekTo: (time: number) => void;
}

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ url, title }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      seekTo(time: number) {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
          videoRef.current.play().catch(() => {});
        }
      },
    }));

    return (
      <div className="overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          src={url}
          controls
          className="w-full aspect-video"
          title={title}
          preload="metadata"
        />
      </div>
    );
  }
);
