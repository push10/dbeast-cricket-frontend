import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Button } from "@chakra-ui/react";
import "./matchcenter.css";
import { getMatches, updateAvailability } from "../../api/matchApi";

export default function MatchCenter({ currentUser }) {

  const [matches, setMatches] = useState([]);
  const [loadingMatchId, setLoadingMatchId] = useState(null);

  // Fetch matches
  useEffect(() => {

    async function fetchMatches() {

      if (!currentUser) return;

      try {

        const data = await getMatches(currentUser.id);
        console.log("Matches fetched:", data);

        setMatches(data);

      } catch (err) {

        console.error("Failed to fetch matches:", err);

      }
    }

    fetchMatches();

  }, [currentUser]);



  // Toggle availability
  const toggleAvailability = async (matchId) => {

    if (!currentUser) {

      alert("Please login to mark availability");
      return;

    }

    const match = matches.find((m) => m.id === matchId);

    if (!match) return;

    const newStatus = !match.myStatus;

    try {

      setLoadingMatchId(matchId);

      await updateAvailability(matchId, currentUser.id, newStatus);

      setMatches((prevMatches) =>
        prevMatches.map((m) =>
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

    } finally {

      setLoadingMatchId(null);

    }
  };



  return (
    <div className="match-center">

      <h2>🏏 Match Center</h2>

      {/* Create Match Button */}
      <Box textAlign="right" mb={4}>
        <Link to="/create-match">
          <Button colorScheme="blue">
            + Create New Match
          </Button>
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
                match.availableCount >= 11
                  ? "card-green"
                  : "card-yellow"
              }`}
            >

              <div className="match-header">
                <span>{match.matchDate}</span>
              </div>

              <h3>
                {match.teamA} vs {match.teamB}
              </h3>


              <div className="availability">

                <span>
                  {match.availableCount}/11 Players Available
                </span>

                <div className="progress-bar">

                  <div
                    className="progress"
                    style={{ width: `${progress}%` }}
                  ></div>

                </div>

              </div>


              {/* Toggle Availability Button */}
              <button
                disabled={loadingMatchId === match.id}
                className={`toggle-btn ${
                  match.myStatus ? "on" : "off"
                }`}
                onClick={() => toggleAvailability(match.id)}
              >

                {loadingMatchId === match.id
                  ? "Updating..."
                  : match.myStatus
                  ? "Available ✅"
                  : "Not Available ❌"}

              </button>

            </div>

          );

        })}

      </div>

    </div>
  );
}