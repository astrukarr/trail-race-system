"use client";

// Header Component
import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-neutral-900">
              Trail Race System
            </h1>
          </div>

          {isAuthenticated && user && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-neutral-600">
                Welcome, <span className="font-medium">{user.firstName}</span>
                <span className="ml-2 px-2 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full font-medium">
                  {user.role}
                </span>
              </div>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
