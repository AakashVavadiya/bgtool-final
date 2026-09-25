import { useEffect, useState, useRef } from "react";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";

const streamdownPlugins = { cjk, code, math, mermaid };

interface TypewriterMessageProps {
  text: string;
  isLatest: boolean;
  isStreaming?: boolean;
  onCharacterTyped?: () => void;
}

export function TypewriterMessage({
  text,
  isLatest,
  isStreaming = false,
  onCharacterTyped,
}: TypewriterMessageProps) {
  // If it's not the latest message, show full text immediately
  const [displayedLength, setDisplayedLength] = useState(() => (isLatest ? 0 : text.length));
  const [isTyping, setIsTyping] = useState(() => isLatest && text.length > 0);

  const textRef = useRef(text);
  textRef.current = text;

  const onCharacterTypedRef = useRef(onCharacterTyped);
  onCharacterTypedRef.current = onCharacterTyped;

  // Once a message is marked non-latest or fully caught up and not streaming, finalize
  useEffect(() => {
    if (!isLatest) {
      setDisplayedLength(text.length);
      setIsTyping(false);
      return;
    }

    if (displayedLength >= text.length && !isStreaming) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);

    let animationFrameId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - lastTime;
      const targetLength = textRef.current.length;

      // Dynamic pacing: reveal faster if there's a long backlog
      const backlog = targetLength - displayedLength;
      const interval = backlog > 80 ? 6 : backlog > 30 ? 10 : 16;

      if (elapsed >= interval) {
        lastTime = now;
        setDisplayedLength((prev) => {
          if (prev >= targetLength) {
            return prev;
          }
          const increment = backlog > 120 ? 4 : backlog > 40 ? 2 : 1;
          const next = Math.min(targetLength, prev + increment);
          onCharacterTypedRef.current?.();
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [text, isLatest, isStreaming, displayedLength]);

  // Click to reveal all instantly
  const handleInstantReveal = () => {
    if (displayedLength < text.length) {
      setDisplayedLength(text.length);
      setIsTyping(false);
    }
  };

  const visibleText = isLatest ? text.slice(0, displayedLength) : text;
  const showCursor = isLatest && (isTyping || isStreaming || displayedLength < text.length);

  return (
    <div
      onClick={handleInstantReveal}
      className={`relative w-full cursor-default select-text ${showCursor ? "typewriter-active" : ""}`}
      title={showCursor ? "Click to reveal text instantly" : undefined}
    >
      <Streamdown
        className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed break-words font-medium [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 selection:bg-foreground selection:text-background"
        plugins={streamdownPlugins}
      >
        {visibleText}
      </Streamdown>

      {/* Fallback cursor only when text has not started rendering yet */}
      {!visibleText && showCursor && (
        <span
          className="inline-block w-1.5 h-4 bg-foreground/90 rounded-xs animate-pulse align-middle"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
