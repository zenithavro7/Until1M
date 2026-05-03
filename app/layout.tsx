import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Until $1M — The Journey",
  description: "Document the road to a million. One day at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grain font-display">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
