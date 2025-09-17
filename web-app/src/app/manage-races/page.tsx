"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { raceQueryApi, raceCommandApi, Race } from "@/services/api";

export default function ManageRacesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Administrator") {
      router.push("/");
      return;
    }

    fetchRaces();
  }, [isAuthenticated, user, router]);

  const fetchRaces = async () => {
    try {
      setLoading(true);
      const response = await raceQueryApi.getAll();
      setRaces(response.races);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching races");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRace = async (raceId: string) => {
    if (!confirm("Are you sure you want to delete this race?")) {
      return;
    }

    try {
      await raceCommandApi.delete(raceId);
      setRaces(races.filter((race) => race.id !== raceId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error deleting race");
    }
  };

  const handleEditRace = (race: Race) => {
    router.push(`/edit-race?id=${race.id}`);
  };

  const handleCreateRace = () => {
    router.push("/create-race");
  };

  if (!isAuthenticated || user?.role !== "Administrator") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Only administrators can access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Manage Races
              </h1>
              <p className="text-gray-600">Create, edit, and delete races</p>
            </div>
            <button onClick={handleCreateRace} className="btn btn-primary">
              Create New Race
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {races.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-neutral-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Races Found
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first race to get started.
            </p>
            <button onClick={handleCreateRace} className="btn btn-primary">
              Create Race
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {races.map((race) => (
              <div key={race.id} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="card-title mb-2">{race.name}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Distance:
                          </span>
                          <p className="text-gray-600">{race.distance}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Created:
                          </span>
                          <p className="text-gray-600">
                            {new Date(race.createdAt).toLocaleDateString(
                              "en-US"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditRace(race)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRace(race.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
