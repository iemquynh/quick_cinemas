import './globals.css'
import { ToastContainer } from '@/components/Toast'
import { AdminProvider } from '@/hooks/useCurrentUser'


export const metadata = {
  title: 'QuickCinema',
  description: 'Movie booking platform',
  manifest: '/manifest.json'
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="QuickCinema" />
      </head>
      <body>
          <AdminProvider>
            {children}
            <ToastContainer />
          </AdminProvider>
      </body>
    </html>
  )
}
