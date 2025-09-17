"use client";

// Race Card Component
import React from "react";
import { Race } from "@/services/api";

interface RaceCardProps {
  race: Race;
  onApply?: (raceId: string) => void;
  onEdit?: (race: Race) => void;
  onDelete?: (raceId: string) => void;
  showActions?: boolean;
  userRole?: "Applicant" | "Administrator";
}

export const RaceCard: React.FC<RaceCardProps> = ({
  race,
  onApply,
  onEdit,
  onDelete,
  showActions = false,
  userRole,
}) => {
  const formatDistance = (distance: string) => {
    switch (distance) {
      case "5k":
        return "5K";
      case "10k":
        return "10K";
      case "HalfMarathon":
        return "Half Marathon";
      case "Marathon":
        return "Marathon";
      default:
        return distance;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="card group hover:shadow-large transition-all duration-300">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-neutral-900 mb-3 group-hover:text-neutral-700 transition-colors">
              {race.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-neutral-600">
              <span className="px-3 py-1 bg-neutral-100 text-neutral-800 rounded-full font-medium">
                {formatDistance(race.distance)}
              </span>
              <span className="text-neutral-500">
                Created: {formatDate(race.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-3 pt-4 border-t border-neutral-100">
            {userRole === "Applicant" && onApply && (
              <button
                onClick={() => onApply(race.id)}
                className="btn btn-accent btn-sm flex-1"
              >
                Apply Now
              </button>
            )}

            {userRole === "Administrator" && (
              <>
                {onEdit && (
                  <button
                    onClick={() => onEdit(race)}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(race.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
