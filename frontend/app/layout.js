import './globals.css'

export const metadata = {
  title: 'PayChain - Fintech Payment Platform',
  description: 'Hybrid payment platform with blockchain support',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
