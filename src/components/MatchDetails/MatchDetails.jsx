import React, { useState } from "react";
import "./matchcenter.css";
import { markAvailability } from "../api/matchApi"; // API for marking availability

export default function MatchDetails({ match, currentUser, goBack }) {
  const [isAvailable, setIsAvailable] = useState(
    match.playersAvailable?.includes(currentUser.mobile) || false
  );

  const handleToggle = async () => {
    try {
      const updated = await markAvailability(match.id, currentUser.mobile, !isAvailable);
      setIsAvailable(!isAvailable);
      console.log("Availability updated:", updated);
    } catch (err) {
      console.error("Failed to update availability:", err);
    }
  };

  return (
    <div className="match-details-container">
      <button className="back-button" onClick={goBack}>← Back</button>
      <h2>Match Details</h2>
      <div><strong>Date:</strong> {match.matchDate}</div>
      <div><strong>Opponent:</strong> {match.opponent}</div>
      <div><strong>Ground:</strong> {match.ground}</div>
      <div><strong>Confirmed Players:</strong> {match.playersAvailable?.length || 0}</div>

      <div className="availability-section">
        <span>Your Availability: </span>
        <button
          className={`availability-btn ${isAvailable ? "available" : "not-available"}`}
          onClick={handleToggle}
        >
          {isAvailable ? "Available ✅" : "Not Available ❌"}
        </button>
      </div>
    </div>
  );
}