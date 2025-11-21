import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import BotpressScript from "@/components/chatbot/botpress-script";
import BotpressConfig from "@/components/chatbot/botpress-config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thư viện trực tuyến",
  description: "Hệ thống quản lý thư viện trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
          <BotpressScript />
          <BotpressConfig />
        </AuthProvider>
      </body>
    </html>
  );
}
