import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ConnectedProviders from '../components/ConnectedProviders'
import { AppProvider } from '../contexts/AppContext'
import { AuthProvider } from '../contexts/AuthContext'
import { CompareProvider } from '../contexts/CompareContext'
import { CurrencyProvider } from '../contexts/CurrencyContext'
import { GeoProvider } from '../contexts/GeoContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ToastProvider } from '../contexts/ToastContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KAMRI - Hub',
  description: 'Shop-Buy-Go',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <GeoProvider>
              <CurrencyProvider>
                <AppProvider>
                  <CompareProvider>
                    <ToastProvider>
                      <ConnectedProviders>
                        <div className="min-h-screen bg-[#F5F5F5]">
                          <main>{children}</main>
                        </div>
                      </ConnectedProviders>
                    </ToastProvider>
                  </CompareProvider>
                </AppProvider>
              </CurrencyProvider>
            </GeoProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

