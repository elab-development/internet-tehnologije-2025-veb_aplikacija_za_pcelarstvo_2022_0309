"use client";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #cfcfcf",
        outline: "none",
        ...(props.style ?? {}),
      }}
    />
  );
}
