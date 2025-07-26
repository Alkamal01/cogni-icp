import type { Metadata } from "next"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { AuthProvider } from "@/components/providers/session-provider"
import { CurrencyProvider } from "@/contexts/CurrencyContext"
import { Toaster } from "@/components/ui/toaster"
import { TranslationsProvider } from "@/contexts/TranslationsContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PeaceCredit - Building Peace Through Smart Finance",
  description: "Empowering economic resilience in fragile communities through AI-powered financial services and cooperative building.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TranslationsProvider>
            <CurrencyProvider>
              <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                <Navbar />
                {children}
              </ThemeProvider>
            </CurrencyProvider>
          </TranslationsProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
