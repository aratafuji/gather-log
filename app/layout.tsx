import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GatherLog',
  description: 'Log your conference and event interactions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600">
              GatherLog
            </Link>
            <nav>
              <Link href="/participants" className="text-gray-600 hover:text-gray-800">
                参加者一覧
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-white shadow-sm mt-8">
          <div className="container mx-auto px-4 py-4 text-center text-gray-600">
            Created by aratafuji
          </div>
        </footer>
      </body>
    </html>
  )
}

