import "./globals.css";

export const metadata = {
  title: "Inditronics Events Dashboard",
  description:
    "Dashboard for quick view of all events and data from specified device",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen  ">
        <div className="bg-gradient-to-br from-primary/20 via-background to-secondary/20 animate-gradient-x min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
