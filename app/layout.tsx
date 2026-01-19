import type { Metadata } from 'next'
import Providers from './providers'
import { ThemeProvider } from './theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Painel CRP - Dashboard',
  description: 'Sistema de gestão de ações e operações CRP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
