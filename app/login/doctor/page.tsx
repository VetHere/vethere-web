"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function DoctorLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      username,
      password,
    };

    try {
      const response = await fetch("http://localhost:8000/auth/doctor/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        const { access_token, refresh_token } = result.data;
        sessionStorage.setItem("access_token", access_token);
        sessionStorage.setItem("refresh_token", refresh_token);
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userRole", "doctor");
        router.push("/dashboard");
      } else {
        let errorMessage = "Login failed";
        try {
          const result = await response.json();
          errorMessage = result.message || errorMessage;
        } catch {
          errorMessage = "An unexpected error occurred";
        }
        setError(errorMessage);
      }
    } catch {
      setError("Failed to connect to the server");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Doctor Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your doctor account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <Button className="w-full mt-4" type="submit">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/login" className="text-sm text-gray-500 hover:underline">
            Back to main login
          </Link>
          <Link
            href="/login/admin"
            className="text-sm text-gray-500 hover:underline"
          >
            Admin Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
