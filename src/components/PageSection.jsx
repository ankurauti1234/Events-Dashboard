import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const sizeVariants = {
  sm: {
    title: "text-lg font-semibold tracking-tight",
    badge: "h-5 text-xs",
    infoIcon: "size-3",
    infoBadge: "size-5",
    spacing: "space-y-3",
    gap: "gap-2",
  },
  md: {
    title: "text-2xl font-semibold tracking-tight",
    badge: "h-6 text-sm",
    infoIcon: "size-4",
    infoBadge: "size-6",
    spacing: "space-y-4",
    gap: "gap-3",
  },
  lg: {
    title: "text-3xl font-semibold tracking-tight",
    badge: "h-7 text-base",
    infoIcon: "size-5",
    infoBadge: "size-7",
    spacing: "space-y-5",
    gap: "gap-4",
  },
};

const PageSection = ({
  children,
  title,
  description,
  className,
  titleClassName,
  actions,
  badge,
  infoWidth = "w-80",
  showSeparator = true,
  size = "md", // New size prop with default value
}) => {
  const sizeClasses = sizeVariants[size] || sizeVariants.md;

  return (
    <div className={cn(sizeClasses.spacing, className)}>
      <header className="flex flex-col gap-4">
        {/* Title and Info Section */}
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center", sizeClasses.gap)}>
            <h1 className={cn(sizeClasses.title, titleClassName)}>{title}</h1>
            {badge && (
              <Badge variant="secondary" className={sizeClasses.badge}>
                {badge}
              </Badge>
            )}
          </div>

          <div className={cn("flex items-center", sizeClasses.gap)}>
            {description && (
              <HoverCard>
                <HoverCardTrigger>
                  <Badge
                    variant="secondary"
                    className={cn(
                      sizeClasses.infoBadge,
                      "p-1 cursor-help hover:bg-accent transition-colors"
                    )}
                  >
                    <Info className={sizeClasses.infoIcon} />
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent
                  className={cn("text-sm p-4 z-[9999]", infoWidth)}
                  align="end"
                >
                  <p className="text-sm leading-relaxed">{description}</p>
                </HoverCardContent>
              </HoverCard>
            )}
            {actions && (
              <div className={cn("flex items-center", sizeClasses.gap)}>
                {actions}
              </div>
            )}
          </div>
        </div>
      </header>
      

          {showSeparator && <Separator className="bg-border" />}
          
          <section className="bg-card/45 rounded-lg p-4 border-2">{ children}</section>
    </div>
  );
};

export default PageSection;
