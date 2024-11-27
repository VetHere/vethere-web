"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loggedIn)

    if (!loggedIn && pathname !== "/login" && pathname !== "/register") {
      router.push("/login")
    }
  }, [router, pathname])

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

