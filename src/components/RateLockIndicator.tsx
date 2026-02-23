import { useEffect, useState } from "react";

interface Props {
  quoteCreatedAt?: number;
}

const RATE_LOCK_MS = 1000 * 60 * 60;

function formatRemaining(ms: number) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function RateLockIndicator({ quoteCreatedAt }: Props) {
  const [remaining, setRemaining] = useState(() => {
    if (!quoteCreatedAt) {
      return RATE_LOCK_MS;
    }

    return RATE_LOCK_MS - (Date.now() - quoteCreatedAt);
  });

  useEffect(() => {
    if (!quoteCreatedAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemaining(RATE_LOCK_MS - (Date.now() - quoteCreatedAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [quoteCreatedAt]);

  if (!quoteCreatedAt) {
    return null;
  }

  return (
    <p>
      <strong>Rate locked for 60 minutes</strong> — {formatRemaining(remaining)} remaining
    </p>
  );
}
