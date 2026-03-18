import { useEffect, useState } from "react";
import "./matchcenter.css";
import { getMatches, updateAvailability } from "../../api/matchApi";

const MAX_PLAYERS = 11;

function formatMatchDate(matchDate) {
  if (!matchDate) {
    return "Date not set";
  }

  return new Date(matchDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MatchCenter({ currentUser }) {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    async function fetchMatches() {
      if (!currentUser?.id) {
        return;
      }

      try {
        const data = await getMatches(currentUser.id);
        setMatches(data);
      } catch (err) {
        console.error("Failed to fetch matches:", err);
      }
    }

    fetchMatches();
  }, [currentUser?.id]);

  const toggleAvailability = async (matchId) => {
    if (!currentUser?.id) {
      alert("Please login to mark availability");
      return;
    }

    const match = matches.find((item) => item.id === matchId);
    if (!match) {
      return;
    }

    const newStatus = !match.myStatus;

    try {
      await updateAvailability(matchId, currentUser.id, newStatus);

      setMatches((prevMatches) =>
        prevMatches.map((item) =>
          item.id === matchId
            ? {
                ...item,
                myStatus: newStatus,
                availableCount: newStatus
                  ? Math.min(item.availableCount + 1, MAX_PLAYERS)
                  : Math.max(item.availableCount - 1, 0),
              }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update availability:", err);
      alert("Could not update availability. Try again!");
    }
  };

  return (
    <div className="match-center">
      <h2>Match Center</h2>

      <div className="match-grid">
        {matches.map((match) => {
          const progress = (match.availableCount / MAX_PLAYERS) * 100;

          return (
            <div
              key={match.id}
              className={`match-card ${
                match.availableCount >= MAX_PLAYERS ? "card-green" : "card-yellow"
              }`}
            >
              <div className="match-header">{formatMatchDate(match.matchDate)}</div>

              <h3>
                {match.teamA} vs {match.teamB}
              </h3>

              <p className="ground">Availability for this match</p>

              <div className="availability">
                <span>
                  {match.availableCount}/{MAX_PLAYERS} Players Available
                </span>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              <button
                className={`availability-btn ${match.myStatus ? "available" : "not-available"}`}
                onClick={() => toggleAvailability(match.id)}
              >
                {match.myStatus ? "Available" : "Not Available"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
