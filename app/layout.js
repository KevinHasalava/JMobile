import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/shared/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Mobile Shop",
  description: "Mobile Shop Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-zinc-950 text-zinc-100 antialiased selection:bg-orange-500/30 selection:text-orange-200">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
