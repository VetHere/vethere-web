"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loggedIn)
    if (!loggedIn) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/login")
  }

  if (!isLoggedIn) {
    return null // or a loading spinner
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white p-4">
        <nav className="space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
          </Link>
          <Link href="/dashboard/medical-records">
            <Button variant="ghost" className="w-full justify-start">Medical Records</Button>
          </Link>
          <Link href="/dashboard/doctors">
            <Button variant="ghost" className="w-full justify-start">Doctors</Button>
          </Link>
          <Link href="/dashboard/vet-clinics">
            <Button variant="ghost" className="w-full justify-start">Vet Clinics</Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-red-500" onClick={handleLogout}>
            Logout
          </Button>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}

