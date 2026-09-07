import React from 'react';
import { AlignLeft } from 'lucide-react';

export default function TableOfContents({ headings = [] }) {
  if (headings.length === 0) return null;

  return (
    <div className="sticky top-24 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800/80 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
        <AlignLeft className="h-3.5 w-3.5 text-emerald-400" />
        <span>Daftar Isi</span>
      </div>
      <nav className="space-y-1 text-xs">
        {headings.map((heading, idx) => {
          const indent = heading.level === 1 ? 'pl-0 font-medium text-zinc-200' : heading.level === 2 ? 'pl-3 text-zinc-400' : 'pl-6 text-zinc-500';
          return (
            <a
              key={idx}
              href={`#${heading.id}`}
              className={`block py-1 hover:text-emerald-400 transition-colors truncate ${indent}`}
            >
              {heading.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
