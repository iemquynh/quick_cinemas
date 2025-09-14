import './globals.css'
import { ToastContainer } from '@/components/Toast'
import { AdminProvider } from '@/hooks/useCurrentUser'
// import { Nata_Sans } from 'next/font/google'

// const nataSans = Nata_Sans({
//   subsets: ['latin'],
//   weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
//   display: 'swap',
// })



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
      <link
          href="https://fonts.googleapis.com/css2?family=Nata+Sans:wght@100..900&display=swap"
          rel="stylesheet"
        />
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
