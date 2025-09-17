"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  raceQueryApi,
  raceCommandApi,
  Race,
  UpdateRaceData,
} from "@/services/api";

function EditRaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [race, setRace] = useState<Race | null>(null);
  const [formData, setFormData] = useState<UpdateRaceData>({
    name: "",
    distance: "5k",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const raceId = searchParams.get("id");

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "Administrator") {
        router.push("/login"); // Redirect unauthorized users
        return;
      }
      if (raceId) {
        fetchRace();
      } else {
        setError("No race ID provided for editing.");
        setLoading(false);
      }
    }
  }, [user, authLoading, router, raceId]);

  const fetchRace = async () => {
    try {
      setLoading(true);
      const response = await raceQueryApi.getById(raceId!);
      const raceData = response.race;
      setRace(raceData);

      // Pre-populate form with existing data
      setFormData({
        name: raceData.name,
        distance: raceData.distance,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Error loading race for editing");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim() || !formData.distance) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await raceCommandApi.update(raceId!, formData);
      // Redirect to manage races page
      router.push("/manage-races");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating race");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => router.back()} className="btn btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "Administrator") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Only administrators can edit races.</p>
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Race Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The race you are trying to edit does not exist or an invalid ID was
            provided.
          </p>
          <button
            onClick={() => router.push("/manage-races")}
            className="btn btn-secondary"
          >
            Go to Manage Races
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Race</h1>
            <p className="text-gray-600">Update race information</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="card">
            <form onSubmit={handleSubmit} className="card-body">
              <div className="mb-6">
                <label htmlFor="name" className="form-label">
                  Race Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Spring Trail Run"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="distance" className="form-label">
                  Distance *
                </label>
                <select
                  id="distance"
                  name="distance"
                  value={formData.distance}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="5k">5K</option>
                  <option value="10k">10K</option>
                  <option value="HalfMarathon">Half Marathon</option>
                  <option value="Marathon">Marathon</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1"
                >
                  {submitting ? "Updating..." : "Update Race"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditRacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="spinner h-8 w-8"></div>
        </div>
      }
    >
      <EditRaceContent />
    </Suspense>
  );
}
