import { useState } from "react";
import { Sparkles } from "lucide-react";
import karudiKLogo from "@/assets/karudi-k-logo.png";

type Props = {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
};

export function KarudiAvatar({ size = "md", className = "" }: Props) {
  const [imgError, setImgError] = useState(false);

  const containerSize = {
    sm: "h-7 w-7 rounded-full",
    md: "h-9 w-9 rounded-full",
    lg: "h-12 w-12 rounded-full",
    xl: "h-20 w-20 rounded-full",
    "2xl": "h-28 w-28 rounded-full",
  }[size];

  const fontSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
    xl: "text-3xl",
    "2xl": "text-5xl",
  }[size];

  const badgeSize = {
    sm: "-bottom-0.5 -right-0.5 h-2.5 w-2.5",
    md: "-bottom-0.5 -right-0.5 h-3 w-3",
    lg: "-bottom-1 -right-1 h-3.5 w-3.5",
    xl: "-bottom-1 -right-1 h-5 w-5",
    "2xl": "-bottom-1.5 -right-1.5 h-6 w-6",
  }[size];

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center transition-all hover:scale-105 ${containerSize} ${className}`}
    >
      <div className={`flex h-full w-full items-center justify-center bg-black text-foreground overflow-hidden rounded-full shadow-xs`}>
        {!imgError ? (
          <img
            src={karudiKLogo}
            alt="Karudi AI"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <span className={`font-display font-extrabold tracking-tighter text-white select-none ${fontSize}`}>
            K<span className="text-white">.</span>
          </span>
        )}
      </div>
      <span
        className={`absolute flex items-center justify-center rounded-full bg-emerald-500 ring-2 ring-background shadow-md ${badgeSize}`}
      >
        <Sparkles className="h-2/3 w-2/3 text-white animate-pulse" />
      </span>
    </div>
  );
}

export const KrishnaAvatar = KarudiAvatar;
