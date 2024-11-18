import FlickeringGrid from "@/components/ui/flickering-grid";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Inditronics Events Dashboard",
  description:
    "Dashboard for quick view of all events and data from specified device",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen relative  ">
        <FlickeringGrid
          className=" absolute inset-0 size-full -z-10"
          squareSize={4}
          gridGap={6}
          color="#0B43DA"
          maxOpacity={0.5}
          flickerChance={0.1}
        />
        <div className="bg-gradient-to-br from-primary/20 via-background to-secondary/20 animate-gradient-x min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
