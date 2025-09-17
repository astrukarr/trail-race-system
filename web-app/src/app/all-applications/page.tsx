"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { applicationQueryApi, Application } from "@/services/api";

export default function AllApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Administrator") {
      router.push("/");
      return;
    }

    fetchAllApplications();
  }, [isAuthenticated, user, router]);

  const fetchAllApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationQueryApi.getAll();
      setApplications(response.applications || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error fetching applications");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Applications
          </h1>
          <p className="text-gray-600">
            View and manage all race applications
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Applications Found
            </h3>
            <p className="text-gray-600">
              No applications have been submitted yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => (
              <div key={application.id} className="card">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="card-title mb-2">
                        {application.raceName || `Race ${application.raceId}`}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Applicant:</span>
                          <p className="text-gray-600">
                            {application.firstName} {application.lastName}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Club:</span>
                          <p className="text-gray-600">
                            {application.club || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Applied:</span>
                          <p className="text-gray-600">
                            {new Date(application.createdAt).toLocaleDateString("en-US")}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Status:</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Submitted
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {applications.length > 0 && (
          <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <p className="text-gray-600">
              Total applications: <span className="font-semibold">{applications.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
