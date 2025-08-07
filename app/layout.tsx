import './globals.css'
import { ToastContainer } from '@/components/Toast'
import { AdminProvider } from '@/hooks/useCurrentUser'

export const metadata = {
  title: 'QuickCinema',
  description: 'Movie booking platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
          <AdminProvider>
            {children}
            <ToastContainer />
          </AdminProvider>
      </body>
    </html>
  )
}
