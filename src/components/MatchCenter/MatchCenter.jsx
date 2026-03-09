import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Button } from "@chakra-ui/react";
import "./matchcenter.css";
import { getMatches, updateAvailability } from "../../api/playerApi";

export default function MatchCenter({ currentUser }) {
  const [matches, setMatches] = useState([]);

  // Fetch all matches on mount
  useEffect(() => {
    async function fetchMatches() {
      try {
        const data = await getMatches();
        console.log("Matches fetched:", data); // <-- Add this line
        setMatches(data);
      } catch (err) {
        console.error("Failed to fetch matches:", err);
      }
    }
    fetchMatches();
  }, []);

  // Toggle current user's availability for a match
  const toggleAvailability = async (matchId) => {
    if (!currentUser) {
      alert("Please login to mark availability");
      return;
    }

    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const newStatus = !match.myStatus;

    try {
      await updateAvailability(matchId, currentUser.id, newStatus);

      // Update local state
      setMatches(
        matches.map((m) =>
          m.id === matchId
            ? {
                ...m,
                myStatus: newStatus,
                availableCount: newStatus
                  ? Math.min(m.availableCount + 1, 11)
                  : Math.max(m.availableCount - 1, 0),
              }
            : m
        )
      );
    } catch (err) {
      console.error("Failed to update availability:", err);
      alert("Could not update availability. Try again!");
    }
  };

  return (
    <div className="match-center">
      <h2>🏏 Match Center</h2>

      {/* Create Match Button */}
      <Box textAlign="right" mb={4}>
        <Link to="/create-match">
          <Button colorScheme="blue">+ Create New Match</Button>
        </Link>
      </Box>

      {/* Match Cards */}
      <div className="match-grid">
        {matches.map((match) => {
          const progress = (match.availableCount / 11) * 100;

          return (
            <div
              key={match.id}
              className={`match-card ${
                match.availableCount >= 11 ? "card-green" : "card-yellow"
              }`}
            >
              <div className="match-header">
                <span>{match.date}</span>
              </div>

              <h3>vs {match.opponent}</h3>
              <p className="ground">{match.ground}</p>

              <div className="availability">
                <span>{match.availableCount}/11 Players Available</span>
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Availability Toggle Button */}
              <button
                className={`availability-btn ${
                  match.myStatus ? "available" : "not-available"
                }`}
                onClick={() => toggleAvailability(match.id)}
              >
                {match.myStatus ? "Available ✅" : "Not Available ❌"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}