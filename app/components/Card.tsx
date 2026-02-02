"use client";
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 14 }}>
      {children}
    </div>
  );
}
