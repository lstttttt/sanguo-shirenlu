import type { Metadata, Viewport } from "next";
import { editorialCopy } from "@/data/editorial";
import "./globals.css";

export const metadata: Metadata = {
  title: editorialCopy.homeTitle,
  description: editorialCopy.homeInstruction,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f3e9",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
