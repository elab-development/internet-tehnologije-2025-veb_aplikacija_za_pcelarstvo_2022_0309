"use client";
export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #cfcfcf",
        cursor: "pointer",
        fontWeight: 600,
        ...(props.style ?? {}),
      }}
    >
      {children}
    </button>
  );
}
