"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GitBranchPlus,
  Users,
  Settings,
  FileCode2,
  ServerCrash,
  Shield,
  HelpCircle,
  Terminal,
  Sparkles,
} from "lucide-react";

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Workspaces",
    href: "/workspaces",
    icon: GitBranchPlus,
  },
  {
    title: "Templates",
    href: "/templates",
    icon: FileCode2,
  },
  {
    title: "Deployments",
    href: "/deployments",
    icon: ServerCrash,
  },
  {
    title: "Terminal",
    href: "/terminal",
    icon: Terminal,
  },
  {
    title: "AI Assistant",
    href: "/ai-assistant",
    icon: Sparkles,
  },
  {
    title: "Team",
    href: "/team",
    icon: Users,
  },
  {
    title: "Security",
    href: "/security",
    icon: Shield,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    href: "/support",
    icon: HelpCircle,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start px-2 py-4">
      {items.map((item, index) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
              isActive
                ? "bg-muted text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}