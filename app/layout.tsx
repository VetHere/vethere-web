"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
