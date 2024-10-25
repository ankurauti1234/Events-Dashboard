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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import {
  User,
  Eye,
  EyeOff,
  Lock,
  Shield,
  UserCheck,
  RefreshCcw,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";

export default function Login() {
  const [emailOrname, setEmailOrname] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("visitor");
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
          body: JSON.stringify({ emailOrname, password, userType }),
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
    <div
      className="flex min-h-screen flex-col items-center justify-center p-24 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/loginBg.png')" }}
    >
      <Toaster />
      <Card className="w-full max-w-md bg-card rounded-3xl py-6 px-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <Image
              src="/images/logo-full.svg"
              alt="logo"
              width={180}
              height={50}
              className=" drop-shadow-2xl"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex w-full items-center justify-between mb-8">
              <h1 className="text-3xl font-thin ">Login</h1>
              <div>
                <Label className="text-xs">Select role</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="w-[180px] rounded-full font-semibold border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <Shield className="mr-2 w-4 h-4" />
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="moderator">
                      <div className="flex items-center">
                        <UserCheck className="mr-2 w-4 h-4" />
                        Moderator
                      </div>
                    </SelectItem>
                    <SelectItem value="visitor">
                      <div className="flex items-center">
                        <User className="mr-2 w-4 h-4" />
                        Visitor
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-0">
              <div className="space-y-6">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="emailOrname"
                    type="text"
                    placeholder="Enter your email or name"
                    value={emailOrname}
                    onChange={(e) => setEmailOrname(e.target.value)}
                    className="pl-10 bg-accent rounded-full border-none"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-accent rounded-full border-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col w-full">
            <Button
              className="w-full rounded-full text-lg font-bold"
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
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
