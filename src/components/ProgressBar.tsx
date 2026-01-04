import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const getColor = () => {
    if (value < 30) return "bg-green-500";
    if (value < 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div
      className={cn(
        "h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
    >
      <div
        className={cn(
          "h-full transition-all duration-1000 ease-out rounded-full",
          getColor()
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
