"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { raceQueryApi, applicationCommandApi, Race } from "@/services/api";

function ApplicationFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    club: "",
  });

  const raceId = searchParams.get("raceId");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (raceId) {
      fetchRace();
    } else {
      setLoading(false);
    }
  }, [raceId, user, router]);

  const fetchRace = async () => {
    try {
      const response = await raceQueryApi.getById(raceId!);
      setRace(response.race);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error loading race");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!raceId) return;

    setSubmitting(true);
    setError(null);

    try {
      await applicationCommandApi.create({
        ...formData,
        raceId,
      });

      router.push("/applications?success=true");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error submitting application");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Login Required
          </h1>
          <p className="text-gray-600">Please log in to apply for races.</p>
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

  if (!raceId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Select a Race
          </h1>
          <p className="text-gray-600 mb-4">
            Please select a race to apply for.
          </p>
          <a href="/" className="btn btn-primary">
            Back to Races
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-sm py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Race Application
          </h1>
          <p className="text-gray-600">
            Please fill in your details to apply for the race
          </p>
        </div>

        {race && (
          <div className="card mb-8">
            <div className="card-body">
              <h2 className="card-title mb-2">{race.name}</h2>
              <p className="text-gray-600">
                <span className="font-medium">Distance:</span> {race.distance}
              </p>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="club" className="form-label">
                  Club
                </label>
                <input
                  type="text"
                  id="club"
                  name="club"
                  value={formData.club}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Optional"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
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

export default function ApplicationFormPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="spinner h-8 w-8"></div>
        </div>
      }
    >
      <ApplicationFormContent />
    </Suspense>
  );
}
