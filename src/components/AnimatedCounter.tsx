import { memo } from "react";

interface RollingDigitProps {
  digit: string;
  duration?: number;
}

const RollingDigit = memo(function RollingDigit({ digit, duration = 400 }: RollingDigitProps) {
  const isNumber = !isNaN(parseInt(digit, 10));
  const num = isNumber ? parseInt(digit, 10) : 0;

  if (!isNumber) {
    return <span className="inline-block select-none">{digit}</span>;
  }

  return (
    <span className="relative inline-block h-[1.1em] w-[0.68em] overflow-hidden align-baseline select-none pointer-events-none">
      <span
        className="flex flex-col will-change-transform"
        style={{
          transform: `translateY(-${num * 10}%)`,
          transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="flex h-[1.1em] items-center justify-center leading-none">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
});

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 450,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: AnimatedCounterProps) {
  const numValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const formattedStr = decimals > 0 ? numValue.toFixed(decimals) : Math.round(numValue).toString();
  const chars = formattedStr.split("");

  return (
    <span className={`inline-flex items-baseline tabular-nums leading-none font-bold tracking-normal ${className}`}>
      {prefix && <span className="mr-0.5 select-none">{prefix}</span>}
      <span className="inline-flex items-baseline">
        {chars.map((char, index) => (
          <RollingDigit key={`${chars.length - index}-${char}`} digit={char} duration={duration} />
        ))}
      </span>
      {suffix && <span className="select-none">{suffix}</span>}
    </span>
  );
}
