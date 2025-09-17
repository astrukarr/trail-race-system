"use client";

// Navigation Component
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export const Navigation: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated || !user) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: "/", label: "Races", roles: ["Applicant", "Administrator"] },
    {
      path: "/applications",
      label: "My Applications",
      roles: ["Applicant"],
    },
    { path: "/manage-races", label: "Manage Races", roles: ["Administrator"] },
    {
      path: "/all-applications",
      label: "All Applications",
      roles: ["Administrator"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <nav className="bg-white border-b border-neutral-200">
      <div className="container">
        <div className="flex space-x-8">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                isActive(item.path)
                  ? "border-neutral-800 text-neutral-800"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
