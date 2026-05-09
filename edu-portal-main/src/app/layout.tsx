import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ToastProvider } from "@/components/shared/Toast";
import ThemeInitializer from "@/components/theme/ThemeInitializer";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Campus Portal",
  description: "Student and Faculty College Campus Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-sans`} style={{ margin: 0 }}>
        <ThemeInitializer />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
