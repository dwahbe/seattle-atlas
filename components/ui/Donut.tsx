'use client';

interface DonutProps {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  title?: string;
  label?: string;
  className?: string;
}

function getScoreColor(score: number, max: number): string {
  const percent = (score / max) * 100;
  if (percent >= 90) return 'rgb(34, 197, 94)'; // green-500
  if (percent >= 70) return 'rgb(74, 222, 128)'; // green-400
  if (percent >= 50) return 'rgb(250, 204, 21)'; // yellow-400
  if (percent >= 25) return 'rgb(251, 146, 60)'; // orange-400
  return 'rgb(248, 113, 113)'; // red-400
}

export function Donut({
  value,
  min = 0,
  max = 100,
  size = 64,
  strokeWidth = 6,
  title,
  label,
  className,
}: DonutProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.max(min, Math.min(max, value));
  const progress = (normalizedValue - min) / (max - min);
  const offset = circumference * (1 - progress);
  const color = getScoreColor(value, max);

  return (
    <div className={`flex flex-col items-center gap-2 ${className || ''}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={title || label || `Progress: ${value}`}
      >
        {title && <title>{title}</title>}
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--border-color))"
          strokeWidth={strokeWidth}
          opacity={0.6}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
        {/* Center text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgb(var(--text-primary))"
          fontSize={size * 0.28}
          fontWeight="600"
        >
          {Math.round(value)}
        </text>
      </svg>
      {label && (
        <span className="text-xs text-text-secondary font-medium">{label}</span>
      )}
    </div>
  );
}
