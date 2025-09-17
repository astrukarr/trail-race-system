"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { raceCommandApi, CreateRaceData } from "@/services/api";

export default function CreateRacePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState<CreateRaceData>({
    name: "",
    distance: "5k",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "Administrator") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">Only administrators can create races.</p>
        </div>
      </div>
    );
  }

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

    if (!formData.name.trim() || !formData.distance) {
      setError("Please fill in all required fields (Name and Distance).");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await raceCommandApi.create(formData);
      router.push("/manage-races"); // Redirect to manage races page
    } catch (err: any) {
      setError(err.response?.data?.message || "Error creating race");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Race
            </h1>
            <p className="text-gray-600">
              Enter the details for the new trail race.
            </p>
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
                  {submitting ? "Creating..." : "Create Race"}
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
