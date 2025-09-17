"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  applicationQueryApi,
  applicationCommandApi,
  Application,
} from "@/services/api";

export default function MyApplicationsPage() {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchApplications();
    }

    // Check for success message from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      // You could show a success message here
    }
  }, [token]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationQueryApi.getAll();
      setApplications(response.applications || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error loading applications");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      await applicationCommandApi.delete(applicationId);
      setApplications(applications.filter((app) => app.id !== applicationId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error deleting application");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Login Required
          </h1>
          <p className="text-gray-600">
            Please log in to view your applications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Applications
          </h1>
          <p className="text-gray-600">
            Review and manage your race applications
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="spinner h-8 w-8"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Applications
            </h3>
            <p className="text-gray-600 mb-4">
              You haven't applied for any races yet.
            </p>
            <a href="/" className="btn btn-primary">
              View Available Races
            </a>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="grid gap-6">
            {applications.map((application) => (
              <div key={application.id} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="card-title mb-2">
                        {application.raceName || `Race ${application.raceId}`}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">First Name:</span>{" "}
                          {application.firstName}
                        </p>
                        <p>
                          <span className="font-medium">Last Name:</span>{" "}
                          {application.lastName}
                        </p>
                        {application.club && (
                          <p>
                            <span className="font-medium">Club:</span>{" "}
                            {application.club}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Application Date:</span>{" "}
                          {new Date(application.createdAt).toLocaleDateString(
                            "en-US"
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteApplication(application.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
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
