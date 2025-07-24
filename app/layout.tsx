import './globals.css'
import { ToastContainer } from '@/components/Toast'

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
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
