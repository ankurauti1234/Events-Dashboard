"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { User, Eye, EyeOff, Lock, RefreshCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";

export default function Login() {
  const [emailOrname, setEmailOrname] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrname, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.message === "Please verify your email before logging in") {
          router.push(`/verify-email?email=${encodeURIComponent(emailOrname)}`);
        } else {
          Cookies.set("token", data.token);
          Cookies.set("name", data.name);
          Cookies.set("role", data.role);
          Cookies.set("email", data.email);
          Cookies.set("expiry", data.expiry);

          router.push("/");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "An error occurred");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-primary/20 to-secondary/20">
      <Toaster />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-2">
            <Image
              src="/images/inditronics_logo.svg"
              alt="logo"
              layout="fill"
              objectFit="contain"
              className="drop-shadow-md"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Inditronics</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Login to access your Dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrname" className="text-sm font-medium">
                Email or Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="emailOrname"
                  type="text"
                  placeholder="Enter your email or username"
                  value={emailOrname}
                  onChange={(e) => setEmailOrname(e.target.value)}
                  className="pl-10 bg-background/50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            className="w-full"
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Login"
            )}
          </Button>
          {/* <div className="flex justify-between w-full text-sm">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              Forgot Password?
            </Link>
            <Link
              href="/signup"
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              Create an account
            </Link>
          </div> */}
        </CardFooter>
      </Card>
    </div>
  );
}
