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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div 
            key={idx} 
            className="p-3 sm:p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-0.5 truncate">
                {item.title}
              </span>
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {item.value}
              </span>
            </div>
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-zinc-800/60 flex items-center justify-center text-zinc-400 shrink-0">
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
