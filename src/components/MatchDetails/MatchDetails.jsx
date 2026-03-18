import React, { useState } from "react";
import "./matchdetails.css";
import { updateAvailability } from "../../api/matchApi";

export default function MatchDetails({ match, currentUser, goBack }) {
  const [isAvailable, setIsAvailable] = useState(Boolean(match.myStatus));

  const handleToggle = async () => {
    try {
      await updateAvailability(match.id, currentUser.id, !isAvailable);
      setIsAvailable(!isAvailable);
    } catch (err) {
      console.error("Failed to update availability:", err);
    }
  };

  return (
    <div className="match-details-container">
      <button className="back-button" onClick={goBack}>Back</button>
      <h2>Match Details</h2>
      <div><strong>Date:</strong> {match.matchDate}</div>
      <div><strong>Fixture:</strong> {match.teamA} vs {match.teamB}</div>
      <div><strong>Confirmed Players:</strong> {match.availableCount || 0}</div>

      <div className="availability-section">
        <span>Your Availability: </span>
        <button
          className={`availability-btn ${isAvailable ? "available" : "not-available"}`}
          onClick={handleToggle}
        >
          {isAvailable ? "Available" : "Not Available"}
        </button>
      </div>
    </div>
  );
}
