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
  const [formFocus, setFormFocus] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-primary/20 via-background to-secondary/20 animate-gradient-x">
      <Toaster position="top-center" />
      <div className="w-full max-w-md perspective-1000">
        <Card
          className={`bg-card/95 backdrop-blur-md shadow-lg transition-transform duration-500 ease-out ${
            formFocus ? "scale-105" : "scale-100"
          } hover:shadow-xl border-primary/20`}
        >
          <CardHeader className="space-y-1 flex flex-col items-center pb-6">
            <div className="relative w-24 h-24 mb-4 group">
              <div className="absolute inset-0 bg-primary/10 rounded-full transform transition-transform duration-300 group-hover:scale-110" />
              <Image
                src="/images/inditronics_logo.svg"
                alt="logo"
                layout="fill"
                objectFit="contain"
                className="drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pb-1">
              Inditronics
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground/80 text-sm">
              Welcome back! Please enter your details
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              onFocus={() => setFormFocus(true)}
              onBlur={() => setFormFocus(false)}
            >
              <div className="space-y-2">
                <Label
                  htmlFor="emailOrname"
                  className="text-sm font-medium inline-flex items-center gap-2"
                >
                  <User size={16} className="text-primary/80" />
                  Email or Username
                </Label>
                <div className="relative group">
                  <Input
                    id="emailOrname"
                    type="text"
                    placeholder="Enter your email or username"
                    value={emailOrname}
                    onChange={(e) => setEmailOrname(e.target.value)}
                    className="pl-4 bg-background/50 h-11 transition-all duration-300 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:bg-background/80"
                    required
                  />
                  <div className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium inline-flex items-center gap-2"
                >
                  <Lock size={16} className="text-primary/80" />
                  Password
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-4 bg-background/50 h-11 transition-all duration-300 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:bg-background/80"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary focus:outline-none transition-colors duration-200"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <div className="absolute inset-0 rounded-md bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  <span className="animate-pulse">Authenticating...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock size={18} />
                  Sign In
                </span>
              )}
            </Button>

            {/* Uncomment if you want to add these links back
            <div className="flex justify-between w-full text-sm pt-2">
              <Link
                href="/forgot-password"
                className="text-primary/80 hover:text-primary transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
              >
                Forgot Password?
              </Link>
              <Link
                href="/signup"
                className="text-primary/80 hover:text-primary transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
              >
                Create an account
              </Link>
            </div>
            */}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
