"use client";
import React, { useState, useEffect } from "react";
import {
  Menu,
  Sun,
  Moon,
  Laptop,
  LogOut,
  Bell,
  Settings,
  User,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useTimezoneStore } from "@/stores/timezoneStore";
import { useThemeStore } from "@/stores/themeStore";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";

export default function Topbar() {
  const { theme, setTheme } = useThemeStore();
  const [username, setUsername] = useState("");
  const { timezone, setTimezone } = useTimezoneStore();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const name = Cookies.get("name");
    if (name) {
      setUsername(name);
    }

    const savedTheme = localStorage.getItem("theme") || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
        return <Sun className="h-5 w-5" />;
      case "dark":
        return <Moon className="h-5 w-5" />;
      default:
        return <Laptop className="h-5 w-5" />;
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
    <div
      className={cn(
        "px-4 py-2 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40 transition-all duration-200",
        {
          "shadow-md": isScrolled,
          "shadow-sm": !isScrolled,
        }
      )}
    >
      <div className="flex items-center">
        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 lg:hidden hover:bg-accent"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Menu</TooltipContent>
          </Tooltip>
        </TooltipProvider> */}

        <div className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <Image
            src="/images/inditronics_logo.svg"
            height={36}
            width={36}
            alt="logo"
            className="object-contain"
          />
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Inditronics
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        {/* <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-28 h-9">
            <SelectValue placeholder={timezone} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Indian Time">
                <div className="flex flex-row items-center gap-2">
                  <Image
                    src="/images/india.svg"
                    height={20}
                    width={20}
                    alt="India flag"
                  />
                  <span>IND</span>
                </div>
              </SelectItem>
              <SelectItem value="Russian Time">
                <div className="flex flex-row items-center gap-2">
                  <Image
                    src="/images/russia.svg"
                    height={20}
                    width={20}
                    alt="Russia flag"
                  />
                  <span>RUS</span>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select> */}


        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {getThemeIcon()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => changeTheme("light")}
                    className="gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeTheme("dark")}
                    className="gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeTheme("system")}
                    className="gap-2"
                  >
                    <Laptop className="h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>Theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-8" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="p-1 h-9 hover:bg-accent rounded-full"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-sm">
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {Cookies.get("email")}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-500 focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
