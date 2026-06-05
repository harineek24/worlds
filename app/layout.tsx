import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"

const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Worlds — DSA + Philosophy",
  description: "Learn LeetCode patterns through the lens of world philosophy",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${mono.variable} bg-[#0f0a04] text-[#f5e6c8] min-h-screen flex`}>
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  )
}
