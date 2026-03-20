import { useEffect, useMemo, useState } from "react";
import "./matchcenter.css";
import { getMatches, getNextMatchSquad, updateAvailability } from "../../api/matchApi";
import { getApiErrorMessage } from "../../utils/apiErrors";

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
  const [nextSquad, setNextSquad] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const isCaptain = currentUser?.userRole === "CAPTAIN";
  const hasTeamMembership = Boolean(currentUser?.teams?.length);

  const sortedMatches = useMemo(
    () =>
      [...matches].sort(
        (left, right) => new Date(left.matchDate).getTime() - new Date(right.matchDate).getTime()
      ),
    [matches]
  );

  useEffect(() => {
    async function loadHomeData() {
      if (!currentUser?.id) {
        return;
      }

      try {
        const matchesData = await getMatches(currentUser.id);

        setMatches(matchesData);
        setErrorMessage("");

        if (!hasTeamMembership) {
          setNextSquad(null);
          return;
        }

        try {
          const squadData = await getNextMatchSquad();
          setNextSquad(squadData);
        } catch (err) {
          if (err?.response?.status === 404) {
            setNextSquad(null);
            return;
          }

          throw err;
        }
      } catch (err) {
        console.error("Failed to fetch match center data:", err);
        setErrorMessage(getApiErrorMessage(err, "Could not load match center"));
      }
    }

    loadHomeData();
  }, [currentUser?.id, hasTeamMembership]);

  const syncMatchAvailability = (matchId, playerId, available) => {
    setMatches((prevMatches) =>
      prevMatches.map((item) =>
        item.id === matchId
          ? {
              ...item,
              myStatus: playerId === currentUser?.id ? available : item.myStatus,
              availableCount: available
                ? Math.min(item.availableCount + 1, MAX_PLAYERS)
                : Math.max(item.availableCount - 1, 0),
            }
          : item
      )
    );
  };

  const syncNextSquad = (matchId, playerId, available) => {
    setNextSquad((prev) => {
      if (!prev || prev.matchId !== matchId) {
        return prev;
      }

      let squad = prev.squad;

      if (available) {
        const alreadyIncluded = squad.some((player) => player.id === playerId);
        if (!alreadyIncluded && playerId === currentUser?.id) {
          squad = [
            ...squad,
            {
              id: currentUser.id,
              name: currentUser.name,
              mobile: currentUser.mobile,
              playerRole: currentUser.playerRole,
            },
          ];
        }
      } else {
        squad = squad.filter((player) => player.id !== playerId);
      }

      return {
        ...prev,
        squad,
        availableCount: squad.length,
      };
    });
  };

  const toggleSelfAvailability = async (match) => {
    if (!currentUser?.id) {
      return;
    }

    const newStatus = !match.myStatus;

    if (match.myStatus && !isCaptain) {
      return;
    }

    try {
      await updateAvailability(match.id, currentUser.id, newStatus);
      syncMatchAvailability(match.id, currentUser.id, newStatus);
      syncNextSquad(match.id, currentUser.id, newStatus);
    } catch (err) {
      console.error("Failed to update availability:", err);
      setErrorMessage(getApiErrorMessage(err, "Could not update availability"));
    }
  };

  const removePlayerFromSquad = async (playerId) => {
    if (!nextSquad) {
      return;
    }

    try {
      await updateAvailability(nextSquad.matchId, playerId, false);
      syncNextSquad(nextSquad.matchId, playerId, false);
      syncMatchAvailability(nextSquad.matchId, playerId, false);
    } catch (err) {
      console.error("Failed to remove player from squad:", err);
      setErrorMessage(getApiErrorMessage(err, "Could not update squad"));
    }
  };

  return (
    <div className="match-center">
      <section>
        <div className="section-heading">
          <div>
            <h2>Scheduled Matches</h2>
            <p>All upcoming fixtures in one row. Mark yourself available to enter the squad.</p>
          </div>
          {errorMessage && <div className="inline-error">{errorMessage}</div>}
        </div>

        <div className="match-carousel" role="list">
          {sortedMatches.map((match) => {
            const progress = (match.availableCount / MAX_PLAYERS) * 100;
            const disableToggle = match.myStatus && !isCaptain;

            return (
              <article key={match.id} className="match-card carousel-card" role="listitem">
                <div className="match-header">{formatMatchDate(match.matchDate)}</div>
                <h3>
                  {match.teamA} vs {match.teamB}
                </h3>
                <p className="ground">Availability for this fixture</p>

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
                  onClick={() => toggleSelfAvailability(match)}
                  disabled={disableToggle}
                >
                  {match.myStatus
                    ? disableToggle
                      ? "Available - Captain controls removal"
                      : "Make Unavailable"
                    : "Mark Available"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {hasTeamMembership && (
        <section className="squad-panel">
          <div className="section-heading squad-heading">
            <div>
              <h2>Next Match Squad</h2>
              <p>
                {nextSquad
                  ? `${nextSquad.teamA} vs ${nextSquad.teamB} on ${formatMatchDate(nextSquad.matchDate)}`
                  : "No upcoming match found"}
              </p>
            </div>
            {nextSquad && (
              <div className="squad-count">
                {nextSquad.availableCount}/{MAX_PLAYERS} available
              </div>
            )}
          </div>

          {!nextSquad ? (
            <div className="empty-state">No upcoming match found.</div>
          ) : nextSquad.squad.length === 0 ? (
            <div className="empty-state">No players have marked availability for the next match yet.</div>
          ) : (
            <div className="squad-grid">
              {nextSquad.squad.map((player) => (
                <div key={player.id} className="squad-card">
                  <div>
                    <div className="squad-player-name">{player.name}</div>
                    <div className="squad-player-meta">
                      {player.mobile}
                      {player.playerRole ? ` | ${player.playerRole}` : ""}
                    </div>
                  </div>

                  {isCaptain && (
                    <button
                      className="squad-remove-btn"
                      onClick={() => removePlayerFromSquad(player.id)}
                    >
                      Make unavailable
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
