"use client";

import { useEffect, useRef, useState } from "react";

function easeOutQuad(t: number) {
  return t * (2 - t);
}

interface CountUpProps {
  end: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function CountUp({ end, suffix = "", duration = 1600, className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const startTime = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          setValue(Math.round(easeOutQuad(progress) * end));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
