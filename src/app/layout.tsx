import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'EC Creative Studios',
  description: 'Photography proposals',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
