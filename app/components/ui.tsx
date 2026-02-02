"use client";

import React from "react";

export function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fffbea",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

export function FancyHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #6366f1, #22c55e)",
        borderRadius: 22,
        padding: 26,
        color: "white",
        boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>{subtitle ?? "🐝 Beekeeping Dashboard"}</div>
        <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1, marginTop: 6 }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

export function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 10px 22px rgba(0,0,0,0.07)",
        border: "1px solid #eef2f7",
      }}
    >
      {children}
    </div>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <div style={{ fontWeight: 800, opacity: 0.85 }}>{label}</div>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid #cbd5e1",
          outline: "none",
          background: "#ffffff",
        }}
      />
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <div style={{ fontWeight: 800, opacity: 0.85 }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid #cbd5e1",
          outline: "none",
          background: "#ffffff",
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 16px",
        borderRadius: 14,
        border: "none",
        background: "#4f46e5",
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 900,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: "12px 16px",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        cursor: "pointer",
        fontWeight: 900,
      }}
    >
      {children}
    </button>
  );
}

export function ErrorBox({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 14,
        background: "#fee2e2",
        border: "1px solid #fecaca",
        color: "#991b1b",
        fontWeight: 800,
      }}
    >
      {text}
    </div>
  );
}
