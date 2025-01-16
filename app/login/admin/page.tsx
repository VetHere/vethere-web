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
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { API_BASE_URL } from "@/pages/api/api";

export default function AdminLoginPage() {
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
        sessionStorage.setItem("userRole", "admin");

        const dialog = document.getElementById(
          "successDialog"
        ) as HTMLDialogElement;
        dialog.showModal();

        setTimeout(() => {
          router.push("/dashboard/admin");
        }, 1000);
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
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your admin account
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
          <Link
            href="/register/admin"
            className="text-sm text-gray-500 hover:underline"
          >
            Register as Admin
          </Link>
        </CardFooter>
      </Card>
      <dialog id="successDialog" className="p-6 rounded-lg shadow-lg bg-white">
        <div className="text-center">
          <div className="mb-4 text-green-500">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold">Login Successful!</h3>
          <p className="mb-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </dialog>
    </div>
  );
}
