import React from "react";
import { Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border mt-12 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>© 2024 Made by Inditronics</p>

          <div className="flex items-center gap-4">
            <a
              href="mailto:contact@inditronics.com"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              contact@inditronics.com
            </a>

            <a
              href="tel:+911234567890"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Phone className="w-4 h-4" />
              +91 123 456 7890
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
