// Timeline.tsx
"use client";

import React from "react";
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

// Dynamically import the Timeline component to avoid SSR issues with Gantt
const TimelineComponent = dynamic(() => import('@/components/Timeline'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function TimelinePage() {
  const params = useParams();
  const id = params.id as string;

  return <TimelineComponent id={id} setIsModalNewTaskOpen={() => {}} />;
}
