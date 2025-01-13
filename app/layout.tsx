"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const [user, setUser] = useState<any>(null)

  // useEffect(() => {
  //   const checkUser = async () => {
  //     try {
  //       const currentUser = await getCurrentUser()
  //       setUser(currentUser)
  //       if (!currentUser) {
  //         console.log('ユーザーが認証されていません')
  //       }
  //     } catch (error) {
  //       console.error('ユーザー認証エラー:', error)
  //     }
  //   }
  //   checkUser()
  // }, [])

  // const handleSignIn = async () => {
  //   await signIn()
  // }

  // const handleSignOut = async () => {
  //   await signOut()
  //   setUser(null)
  // }

  return (
    <html lang="ja">
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        <header className="bg-black text-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">GatherLog</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/participants" className="text-white hover:text-gray-300">
                参加者一覧
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-black text-white shadow-sm mt-8">
          <div className="container mx-auto px-4 py-4 text-center text-white">
            Created by aratafuji
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  )
}

