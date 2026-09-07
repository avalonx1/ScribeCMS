import React from 'react';
import { BookOpen, GraduationCap, Video, Clock } from 'lucide-react';

export default function StatsOverview({ stats, posts = [] }) {
  const totalReadingMinutes = posts.reduce((acc, curr) => acc + (curr.reading_time || 1), 0);
  const videoNotesCount = posts.filter(p => p.content?.includes('<iframe') || p.content?.includes('<video')).length;

  const statItems = [
    {
      title: 'Total Catatan',
      value: stats?.totalPosts || posts.length || 0,
      icon: BookOpen
    },
    {
      title: 'Seri Course',
      value: stats?.totalCourses || 0,
      icon: GraduationCap
    },
    {
      title: 'Video Embed',
      value: videoNotesCount,
      icon: Video
    },
    {
      title: 'Est. Waktu Baca',
      value: `${totalReadingMinutes} m`,
      icon: Clock
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div 
            key={idx} 
            className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
                {item.title}
              </span>
              <span className="text-xl font-bold text-white tracking-tight">
                {item.value}
              </span>
            </div>
            <div className="h-8 w-8 rounded-lg bg-zinc-800/60 flex items-center justify-center text-zinc-400">
              <Icon className="h-4 w-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
