interface ProfileCompletenessProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
}

export function ProfileCompleteness({ percentage, size = "md" }: ProfileCompletenessProps) {
  const sizeClasses = {
    sm: { ring: "w-12 h-12", text: "text-xs" },
    md: { ring: "w-16 h-16", text: "text-sm" },
    lg: { ring: "w-20 h-20", text: "text-base" },
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getStrokeColor = () => {
    if (percentage >= 80) return "#22c55e";
    if (percentage >= 50) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className={`relative ${sizeClasses[size].ring}`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${getColor()} ${sizeClasses[size].text}`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}
