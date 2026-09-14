// Google Keep Dark Mode Color Schemes
export const NOTE_COLORS = [
  {
    id: 'default',
    name: 'Default',
    bgClass: 'bg-[#161a26]',
    borderClass: 'border-zinc-800/90',
    hoverBorder: 'hover:border-zinc-700',
    dotColor: '#3f3f46'
  },
  {
    id: 'coral',
    name: 'Coral',
    bgClass: 'bg-[#2c1418]',
    borderClass: 'border-rose-900/50',
    hoverBorder: 'hover:border-rose-700/70',
    dotColor: '#f43f5e'
  },
  {
    id: 'peach',
    name: 'Peach',
    bgClass: 'bg-[#2a1910]',
    borderClass: 'border-amber-900/50',
    hoverBorder: 'hover:border-amber-700/70',
    dotColor: '#fb923c'
  },
  {
    id: 'amber',
    name: 'Sand',
    bgClass: 'bg-[#2b220d]',
    borderClass: 'border-yellow-900/50',
    hoverBorder: 'hover:border-yellow-700/70',
    dotColor: '#eab308'
  },
  {
    id: 'emerald',
    name: 'Sage',
    bgClass: 'bg-[#10271c]',
    borderClass: 'border-emerald-900/50',
    hoverBorder: 'hover:border-emerald-700/70',
    dotColor: '#10b981'
  },
  {
    id: 'teal',
    name: 'Fog',
    bgClass: 'bg-[#0d252a]',
    borderClass: 'border-cyan-900/50',
    hoverBorder: 'hover:border-cyan-700/70',
    dotColor: '#06b6d4'
  },
  {
    id: 'blue',
    name: 'Storm',
    bgClass: 'bg-[#132138]',
    borderClass: 'border-blue-900/50',
    hoverBorder: 'hover:border-blue-700/70',
    dotColor: '#3b82f6'
  },
  {
    id: 'purple',
    name: 'Dusk',
    bgClass: 'bg-[#211633]',
    borderClass: 'border-purple-900/50',
    hoverBorder: 'hover:border-purple-700/70',
    dotColor: '#a855f7'
  },
  {
    id: 'rose',
    name: 'Blossom',
    bgClass: 'bg-[#2d1425]',
    borderClass: 'border-pink-900/50',
    hoverBorder: 'hover:border-pink-700/70',
    dotColor: '#ec4899'
  },
  {
    id: 'clay',
    name: 'Clay',
    bgClass: 'bg-[#221816]',
    borderClass: 'border-stone-800',
    hoverBorder: 'hover:border-stone-700',
    dotColor: '#78716c'
  }
];

export function getNoteColor(colorId) {
  return NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0];
}
