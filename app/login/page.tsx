"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Choose your role to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Link href="/login/doctor" passHref>
            <Button className="w-full">Doctor Login</Button>
          </Link>
          <Link href="/login/admin" passHref>
            <Button className="w-full">Admin Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
