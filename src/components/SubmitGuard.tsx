import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function SubmitGuard({ children }: Props) {
  const hasSecret = Boolean(import.meta.env.VITE_SUBMIT_SECRET);

  if (!hasSecret) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Submission Disabled</h2>
        <p>This environment is not configured for submissions.</p>
      </div>
    );
  }

  return <>{children}</>;
}
