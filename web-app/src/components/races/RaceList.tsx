"use client";

// Race List Component
import React, { useState, useEffect } from "react";
import { Race } from "@/services/api";
import { raceQueryApi } from "@/services/api";
import { RaceCard } from "./RaceCard";
import { useAuth } from "@/components/auth/AuthProvider";

interface RaceListProps {
  onApply?: (raceId: string) => void;
  onEdit?: (race: Race) => void;
  onDelete?: (raceId: string) => void;
  showActions?: boolean;
}

export const RaceList: React.FC<RaceListProps> = ({
  onApply,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const { user } = useAuth();
  const [races, setRaces] = useState<Race[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        setIsLoading(true);
        const response = await raceQueryApi.getAll();
        setRaces(response.races);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load races");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRaces();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="spinner w-8 h-8 mr-3"></div>
        <span className="text-neutral-600 font-medium">Loading races...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-red-600 mb-4 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-secondary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (races.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto h-12 w-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-neutral-600 mb-2 font-medium">No races available</p>
        {user?.role === "Administrator" && (
          <p className="text-sm text-neutral-500">
            Create your first race to get started
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {races.map((race) => (
        <RaceCard
          key={race.id}
          race={race}
          onApply={onApply}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
          userRole={user?.role}
        />
      ))}
    </div>
  );
};
