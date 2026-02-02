"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      try {
        const parsed = JSON.parse(u);
        setUserName(parsed.fullName ?? null);
      } catch {}
    } else {
      setUserName(null);
    }
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserName(null);
    router.push("/login");
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav
          style={{
            padding: 12,
            borderBottom: "1px solid #e5e5e5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
            <a href="/hives">Hives</a>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {userName && <span style={{ opacity: 0.8 }}>👤 {userName}</span>}
            <button
              onClick={logout}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #cfcfcf",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Logout
            </button>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
