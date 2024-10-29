"use client"
import React, { useState, useEffect } from "react";
import {
  Menu,
  Sun,
  Moon,
  Laptop,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useTimezoneStore } from "@/stores/timezoneStore";
import { useThemeStore } from "@/stores/themeStore";
import Image from "next/image";
import { Separator } from "./ui/separator";

export default function Topbar({ toggleSidebar }) {
  const { theme, setTheme } = useThemeStore();
  const [username, setUsername] = useState("");
  const { timezone, setTimezone } = useTimezoneStore();
  const router = useRouter();

  useEffect(() => {
    const name = Cookies.get("name");
    if (name) {
      setUsername(name);
    }

    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme = newTheme;
    if (newTheme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    root.classList.add(effectiveTheme);
    root.style.colorScheme = effectiveTheme;
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-6 w-6" />;
      case "dark":
        return <Moon className="h-6 w-6" />;
      default:
        return <Laptop className="h-6 w-6" />;
    }
  };

  const handleLogout = () => {
    Cookies.remove("name");
    Cookies.remove("token");
    Cookies.remove("expiry");
    Cookies.remove("email");
    Cookies.remove("userId");
    router.push("/login");
  };

  return (
    <div className="bg-card px-4 py-2 flex justify-between items-center border-b z-50">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Image
            src="/images/inditronics_logo.svg"
            height={40}
            width={40}
            alt="logo"
          />
          <h1 className="text-xl font-extrabold text-primary">Inditronics</h1>
        </div>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-fit">
            {" "}
            {/* Increased width to accommodate longer text */}
            <SelectValue placeholder={timezone} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Indian Time">
                <div className="flex flex-row items-center gap-2">
                  <Image src="/images/india.svg" height={24} width={24} />
                  <span>IND</span>
                </div>
              </SelectItem>
              <SelectItem value="Russian Time">
                <div className="flex flex-row items-center gap-2">
                  <Image src="/images/russia.svg" height={24} width={24} />
                  <span>RUS</span>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {getThemeIcon()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Choose theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => changeTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeTheme("system")}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="h-8" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0">
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{username || "User"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="text-red-500">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
