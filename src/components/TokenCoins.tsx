import React from "react";

export type TokenType = "silver" | "gold";

interface TokenCoinProps {
  type: TokenType;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showGlow?: boolean;
}

const sizeMap = {
  xs: "w-3.5 h-3.5 min-w-[14px]",
  sm: "w-4.5 h-4.5 min-w-[18px]",
  md: "w-6 h-6 min-w-[24px]",
  lg: "w-8 h-8 min-w-[32px]",
  xl: "w-12 h-12 min-w-[48px]",
};

export function TokenCoin({
  type,
  size = "md",
  className = "",
  showGlow = false,
}: TokenCoinProps) {
  const isGold = type === "gold";
  const sizeClass = sizeMap[size];

  if (isGold) {
    return (
      <span
        className={`relative inline-flex items-center justify-center shrink-0 select-none ${sizeClass} ${className}`}
        title="Gold Token (Purchased Paid Token)"
      >
        {showGlow && (
          <span className="absolute inset-0 rounded-full bg-amber-400/40 blur-xs animate-pulse" />
        )}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          <defs>
            <linearGradient id="goldOuter" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF176" />
              <stop offset="25%" stopColor="#FBC02D" />
              <stop offset="50%" stopColor="#FFD54F" />
              <stop offset="75%" stopColor="#F57F17" />
              <stop offset="100%" stopColor="#E65100" />
            </linearGradient>
            <linearGradient id="goldInner" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF9C4" />
              <stop offset="35%" stopColor="#FDD835" />
              <stop offset="70%" stopColor="#F9A825" />
              <stop offset="100%" stopColor="#EE9209" />
            </linearGradient>
            <linearGradient id="goldSheen" x1="6" y1="6" x2="26" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Outer Coin Edge with Bevel */}
          <circle cx="16" cy="16" r="15" fill="url(#goldOuter)" stroke="#B26A00" strokeWidth="1" />
          {/* Inner Coin Rim */}
          <circle cx="16" cy="16" r="12" fill="url(#goldInner)" stroke="#FFFDE7" strokeWidth="1" strokeDasharray="1.5 1.5" />
          {/* Sheen Highlight */}
          <path d="M 6 16 A 10 10 0 0 1 24 8 A 12 12 0 0 0 6 16 Z" fill="url(#goldSheen)" opacity="0.6" />
          {/* Center Brand Stamp "bg." */}
          <text
            x="16"
            y="19.6"
            fontSize="9"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            letterSpacing="-0.5"
            textAnchor="middle"
            fill="rgba(0, 0, 0, 0.22)"
          >
            bg.
          </text>
          <text
            x="16"
            y="19"
            fontSize="9"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            letterSpacing="-0.5"
            textAnchor="middle"
            fill="#5A2E00"
            stroke="#FFF9C4"
            strokeWidth="0.25"
          >
            bg<tspan fill="#D84315">.</tspan>
          </text>
          {/* Top-Right Micro Star Accent */}
          <circle cx="21" cy="10" r="1" fill="#FFFFFF" opacity="0.9" />
        </svg>
      </span>
    );
  }

  // Silver Coin (Free Token)
  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${sizeClass} ${className}`}
      title="Silver Token (Free Daily Token)"
    >
      {showGlow && (
        <span className="absolute inset-0 rounded-full bg-slate-300/40 blur-xs" />
      )}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          <linearGradient id="silverOuter" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="25%" stopColor="#CBD5E1" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="75%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <linearGradient id="silverInner" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#E2E8F0" />
            <stop offset="70%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="silverSheen" x1="6" y1="6" x2="26" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Outer Coin Edge with Bevel */}
        <circle cx="16" cy="16" r="15" fill="url(#silverOuter)" stroke="#475569" strokeWidth="1" />
        {/* Inner Coin Rim */}
        <circle cx="16" cy="16" r="12" fill="url(#silverInner)" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="1.5 1.5" />
        {/* Sheen Highlight */}
        <path d="M 6 16 A 10 10 0 0 1 24 8 A 12 12 0 0 0 6 16 Z" fill="url(#silverSheen)" opacity="0.7" />
        {/* Center Brand Stamp "bg." */}
        <text
          x="16"
          y="19.6"
          fontSize="9"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="-0.5"
          textAnchor="middle"
          fill="rgba(0, 0, 0, 0.18)"
        >
          bg.
        </text>
        <text
          x="16"
          y="19"
          fontSize="9"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="-0.5"
          textAnchor="middle"
          fill="#1E293B"
          stroke="#FFFFFF"
          strokeWidth="0.3"
        >
          bg<tspan fill="#2563EB">.</tspan>
        </text>
        {/* Top-Right Micro Accent */}
        <circle cx="21" cy="10" r="1" fill="#FFFFFF" opacity="0.95" />
      </svg>
    </span>
  );
}

interface DualTokenPillProps {
  silver: number;
  gold: number;
  onClick?: () => void;
  className?: string;
}

export function DualTokenPill({
  silver = 0,
  gold = 0,
  onClick,
  className = "",
}: DualTokenPillProps) {
  const total = (silver || 0) + (gold || 0);

  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/80 bg-card/90 px-2.5 sm:px-3 py-1 text-xs font-semibold shadow-2xs hover:bg-muted/70 transition-all select-none ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      title={`Token Balance: ${total} Total (${silver} Free Silver Tokens + ${gold} Purchased Gold Tokens)`}
    >
      {/* Silver Free Tokens */}
      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <TokenCoin type="silver" size="sm" />
        <span className="font-mono font-bold text-[11px] sm:text-xs">{silver}</span>
      </span>

      <span className="text-border text-[10px]">|</span>

      {/* Gold Purchased Tokens */}
      <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
        <TokenCoin type="gold" size="sm" showGlow={gold > 0} />
        <span className="font-mono font-bold text-[11px] sm:text-xs">{gold}</span>
      </span>
    </Component>
  );
}

interface TokenBalanceBreakdownProps {
  silver: number;
  gold: number;
  onGetGoldTokens?: () => void;
  className?: string;
}

export function TokenBalanceBreakdown({
  silver = 0,
  gold = 0,
  onGetGoldTokens,
  className = "",
}: TokenBalanceBreakdownProps) {
  return (
    <div className={`rounded-2xl border border-border/70 bg-card p-3 space-y-2 text-xs ${className}`}>
      <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Token Balance
        </span>
        <span className="font-mono font-black text-foreground">
          {(silver || 0) + (gold || 0)} Total
        </span>
      </div>

      {/* Silver Token Row */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <TokenCoin type="silver" size="sm" />
          <div className="flex flex-col">
            <span className="font-bold text-foreground leading-tight">Silver Tokens</span>
            <span className="text-[10px] text-muted-foreground">Free daily allowance (Refreshes daily)</span>
          </div>
        </div>
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">
          {silver}
        </span>
      </div>

      {/* Gold Token Row */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <TokenCoin type="gold" size="sm" showGlow={gold > 0} />
          <div className="flex flex-col">
            <span className="font-bold text-amber-600 dark:text-amber-400 leading-tight">Gold Tokens</span>
            <span className="text-[10px] text-muted-foreground">Purchased paid tokens (Never expire)</span>
          </div>
        </div>
        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
          {gold}
        </span>
      </div>

      {onGetGoldTokens && (
        <button
          type="button"
          onClick={onGetGoldTokens}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
        >
          <TokenCoin type="gold" size="xs" />
          <span>Get More Gold Tokens</span>
        </button>
      )}
    </div>
  );
}
