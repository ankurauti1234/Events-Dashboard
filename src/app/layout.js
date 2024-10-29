
import "./globals.css";


export const metadata = {
  title: "Inditronics Events Dashboard",
  description: "Dashboard for quick view of all events and data from specified device",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
