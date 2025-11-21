import * as React from "react";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function TooltipTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return <>{children}</>;
}

export function TooltipContent({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute',
      zIndex: 1000,
      background: 'rgba(60,60,60,0.95)',
      color: 'white',
      borderRadius: 6,
      padding: '6px 12px',
      fontSize: 13,
      marginTop: 8,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>{children}</div>
  );
}
