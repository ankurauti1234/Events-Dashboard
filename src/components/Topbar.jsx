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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/stores/themeStore";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";

export default function Topbar() {
  const { theme, setTheme } = useThemeStore();
  const [username, setUsername] = useState("");
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

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
    setIsThemeDropdownOpen(false);
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
        "px-4 py-2 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
        {
          "shadow-lg rounded-lg border-2 border-border/40 scale-95":
            isScrolled,
          "shadow-sm border-b border-border/40 ": !isScrolled,
        }
      )}
    >
      <div className="flex items-center">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="transform transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/images/inditronics_logo.svg"
              height={36}
              width={36}
              alt="logo"
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent transform transition-all duration-300 group-hover:tracking-wider">
            Inditronics
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu
                open={isThemeDropdownOpen}
                onOpenChange={setIsThemeDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="transition-transform duration-200 hover:scale-110"
                  >
                    {getThemeIcon()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40 animate-in slide-in-from-top-2 duration-200"
                >
                  <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[
                    { icon: Sun, label: "Light", value: "light" },
                    { icon: Moon, label: "Dark", value: "dark" },
                    { icon: Laptop, label: "System", value: "system" },
                  ].map(({ icon: Icon, label, value }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => changeTheme(value)}
                      className="gap-2 cursor-pointer transition-colors duration-200 hover:bg-primary/10"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="animate-in zoom-in-50 duration-200"
            >
              Theme
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" className="h-8 opacity-50" />

        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="p-1 h-9 rounded-full transition-all duration-200 hover:bg-accent hover:scale-110"
            >
              <Avatar className="h-7 w-7 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300 hover:ring-primary/40">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-sm font-semibold bg-primary/10">
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 animate-in slide-in-from-top-2 duration-200"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {Cookies.get("email")}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { icon: User, label: "Profile" },
              { icon: Settings, label: "Settings" },
            ].map(({ icon: Icon, label }) => (
              <DropdownMenuItem
                key={label}
                className="cursor-pointer transition-colors duration-200 hover:bg-primary/10"
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{label}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-500 cursor-pointer transition-colors duration-200 hover:bg-red-500/10 focus:text-red-500"
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
