

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 32, text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-2xl', sub: 'text-xs' },
  };
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex-shrink-0">
        <svg width={s.icon} height={s.icon} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#0a0a0a" />
          <circle cx="16" cy="16" r="9" stroke="#22c55e" strokeWidth="2" />
          <circle cx="16" cy="16" r="4" fill="#22c55e" />
          <line x1="16" y1="4" x2="16" y2="8.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="23.5" x2="16" y2="28" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="16" x2="8.5" y2="16" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <line x1="23.5" y1="16" x2="28" y2="16" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="16" r="1.5" fill="#0a0a0a" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight text-white ${s.text}`}>
            OzScan<span className="text-green-400">AI</span>
          </span>
          <span className={`text-zinc-500 font-medium tracking-widest uppercase ${s.sub}`}>
            Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
