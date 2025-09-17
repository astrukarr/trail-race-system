"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { RaceList } from "@/components/races/RaceList";

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleApply = (raceId: string) => {
    router.push(`/apply?raceId=${raceId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="container-sm text-center">
          <div className="mx-auto h-16 w-16 bg-neutral-900 rounded-3xl flex items-center justify-center mb-6">
            <svg
              className="h-8 w-8 text-white"
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
          <h1 className="text-5xl font-bold text-neutral-900 mb-4">
            Welcome to Trail Race System
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Join the ultimate trail running experience. Discover races, connect
            with runners, and push your limits.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/login" className="btn btn-primary btn-lg">
              Sign In
            </a>
            <a href="/register" className="btn btn-secondary btn-lg">
              Get Started
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-3">
              Available Races
            </h1>
            <p className="text-lg text-neutral-600">
              {user?.role === "Applicant"
                ? "Discover and join amazing trail races"
                : "Manage races and applications"}
            </p>
          </div>
        </div>

        <RaceList
          onApply={user?.role === "Applicant" ? handleApply : undefined}
          showActions={true}
        />
      </div>
    </div>
  );
}
