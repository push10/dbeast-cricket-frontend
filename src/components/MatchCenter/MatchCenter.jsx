import { useEffect, useMemo, useState } from "react";
import "./matchcenter.css";
import {
  completeMatch,
  getMatchPlayers,
  getMatches,
  getNextMatchSquad,
  updateAvailability,
} from "../../api/matchApi";
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

function isCaptainForTeam(currentUser, teamName) {
  return (currentUser?.teams || []).some(
    (team) => team.role === "CAPTAIN" && team.teamName === teamName
  );
}

export default function MatchCenter({ currentUser }) {
  const [matches, setMatches] = useState([]);
  const [nextSquad, setNextSquad] = useState(null);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [selectedMatchPlayers, setSelectedMatchPlayers] = useState([]);
  const [loadingMatchPlayers, setLoadingMatchPlayers] = useState(false);
  const [updatingPlayerIds, setUpdatingPlayerIds] = useState([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showMyTeamOnly, setShowMyTeamOnly] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [completingMatchId, setCompletingMatchId] = useState(null);

  const isCaptain = currentUser?.userRole === "CAPTAIN";
  const hasTeamMembership = Boolean(currentUser?.teams?.length);

  const sortedMatches = useMemo(
    () =>
      [...matches].sort(
        (left, right) => new Date(left.matchDate).getTime() - new Date(right.matchDate).getTime()
      ),
    [matches]
  );

  const selectedMatch = useMemo(
    () => sortedMatches.find((match) => match.id === selectedMatchId) || null,
    [sortedMatches, selectedMatchId]
  );

  const canCaptainManageMatch = (match) =>
    (currentUser?.teams || []).some(
      (team) =>
        team.role === "CAPTAIN" &&
        (team.teamName === match.teamA || team.teamName === match.teamB)
    );

  const canCaptainManagePlayer = (player) => isCaptainForTeam(currentUser, player.teamName);

  const filteredSelectedMatchPlayers = useMemo(() => {
    return selectedMatchPlayers.filter((player) => {
      if (showAvailableOnly && !player.available) {
        return false;
      }

      if (showMyTeamOnly && !canCaptainManagePlayer(player)) {
        return false;
      }

      return true;
    });
  }, [selectedMatchPlayers, showAvailableOnly, showMyTeamOnly]);

  const groupedSelectedMatchPlayers = useMemo(() => {
    if (!selectedMatch) {
      return [];
    }

    const playersByTeam = filteredSelectedMatchPlayers.reduce((groups, player) => {
      const currentGroup = groups[player.teamName] || [];
      return {
        ...groups,
        [player.teamName]: [...currentGroup, player],
      };
    }, {});

    return [selectedMatch.teamA, selectedMatch.teamB]
      .filter((teamName) => Boolean(teamName))
      .map((teamName) => ({
        teamName,
        players: playersByTeam[teamName] || [],
      }));
  }, [filteredSelectedMatchPlayers, selectedMatch]);

  const hasVisibleRosterPlayers = groupedSelectedMatchPlayers.some((group) => group.players.length > 0);

  const isMatchOnOrBeforeToday = (matchDate) => {
    if (!matchDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fixtureDate = new Date(matchDate);
    fixtureDate.setHours(0, 0, 0, 0);

    return fixtureDate.getTime() <= today.getTime();
  };

  const loadHomeData = async () => {
    if (!currentUser?.id) {
      return;
    }

    try {
      const matchesData = await getMatches(currentUser.id);

      setMatches(matchesData);
      setErrorMessage("");

      if (!hasTeamMembership) {
        setNextSquad(null);
        setSelectedMatchId(null);
        return;
      }

      setSelectedMatchId((currentSelectedMatchId) => {
        if (matchesData.some((match) => match.id === currentSelectedMatchId)) {
          return currentSelectedMatchId;
        }

        return matchesData[0]?.id ?? null;
      });

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
  };

  const loadSelectedMatchPlayers = async (matchId) => {
    if (!matchId) {
      setSelectedMatchPlayers([]);
      return;
    }

    setLoadingMatchPlayers(true);

    try {
      const players = await getMatchPlayers(matchId);
      setSelectedMatchPlayers(players);
      setErrorMessage("");
    } catch (err) {
      console.error("Failed to load match players:", err);
      setSelectedMatchPlayers([]);
      setErrorMessage(getApiErrorMessage(err, "Could not load match players"));
    } finally {
      setLoadingMatchPlayers(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, [currentUser?.id, hasTeamMembership]);

  useEffect(() => {
    if (!selectedMatchId) {
      setSelectedMatchPlayers([]);
      return;
    }

    loadSelectedMatchPlayers(selectedMatchId);
  }, [selectedMatchId]);

  const syncMatchAvailability = (matchId, playerId, available) => {
    setMatches((prevMatches) =>
      prevMatches.map((item) => {
        if (item.id !== matchId) {
          return item;
        }

        const rosterPlayer =
          selectedMatchId === matchId
            ? selectedMatchPlayers.find((player) => player.id === playerId)
            : null;
        const shouldAffectCount =
          playerId === currentUser?.id || !rosterPlayer || canCaptainManagePlayer(rosterPlayer);

        return {
          ...item,
          myStatus: playerId === currentUser?.id ? available : item.myStatus,
          availableCount: shouldAffectCount
            ? available
              ? Math.min(item.availableCount + 1, MAX_PLAYERS)
              : Math.max(item.availableCount - 1, 0)
            : item.availableCount,
        };
      })
    );
  };

  const syncNextSquad = (matchId, playerId, available) => {
    setNextSquad((prev) => {
      if (!prev || prev.matchId !== matchId) {
        return prev;
      }

      let squad = prev.squad;
      const rosterPlayer =
        selectedMatchPlayers.find((player) => player.id === playerId) ||
        (playerId === currentUser?.id
          ? {
              id: currentUser.id,
              name: currentUser.name,
              mobile: currentUser.mobile,
              playerRole: currentUser.playerRole,
            }
          : null);

      if (available) {
        const alreadyIncluded = squad.some((player) => player.id === playerId);
        if (!alreadyIncluded && rosterPlayer) {
          squad = [
            ...squad,
            {
              id: rosterPlayer.id,
              name: rosterPlayer.name,
              mobile: rosterPlayer.mobile,
              playerRole: rosterPlayer.playerRole,
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

  const syncSelectedMatchPlayers = (matchId, playerId, available) => {
    if (selectedMatchId !== matchId) {
      return;
    }

    setSelectedMatchPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === playerId
          ? {
              ...player,
              available,
            }
          : player
      )
    );
  };

  const handleAvailabilityUpdate = async (matchId, playerId, available) => {
    setUpdatingPlayerIds((prev) => [...prev, playerId]);

    try {
      await updateAvailability(matchId, playerId, available);
      syncSelectedMatchPlayers(matchId, playerId, available);
      syncMatchAvailability(matchId, playerId, available);
      syncNextSquad(matchId, playerId, available);
      setErrorMessage("");
    } catch (err) {
      console.error("Failed to update availability:", err);
      setErrorMessage(getApiErrorMessage(err, "Could not update availability"));
    } finally {
      setUpdatingPlayerIds((prev) => prev.filter((id) => id !== playerId));
    }
  };

  const toggleSelfAvailability = async (match) => {
    if (!currentUser?.id) {
      return;
    }

    const newStatus = !match.myStatus;

    if (match.myStatus && !isCaptain) {
      return;
    }

    await handleAvailabilityUpdate(match.id, currentUser.id, newStatus);
  };

  const handleRosterAvailabilityToggle = async (player) => {
    if (!selectedMatch) {
      return;
    }

    const isSelf = player.id === currentUser?.id;

    if (!canCaptainManagePlayer(player) && !isSelf) {
      return;
    }

    await handleAvailabilityUpdate(selectedMatch.id, player.id, !player.available);
  };

  const handleMarkCompleted = async (matchId) => {
    setCompletingMatchId(matchId);

    try {
      await completeMatch(matchId);
      await loadHomeData();
      setErrorMessage("");
    } catch (err) {
      console.error("Failed to mark match completed:", err);
      setErrorMessage(getApiErrorMessage(err, "Could not mark match completed"));
    } finally {
      setCompletingMatchId(null);
    }
  };

  return (
    <div className="match-center">
      <section>
        <div className="section-heading">
          <div>
            <h2>Scheduled Matches</h2>
            <p>Open a match, review the roster, and captains can set player availability for that fixture.</p>
          </div>
          {errorMessage && <div className="inline-error">{errorMessage}</div>}
        </div>

        <div className="match-carousel" role="list">
          {sortedMatches.map((match) => {
            const progress = (match.availableCount / MAX_PLAYERS) * 100;
            const disableToggle = match.myStatus && !isCaptain;
            const isSelected = selectedMatchId === match.id;

            return (
              <article
                key={match.id}
                className={`match-card carousel-card ${isSelected ? "selected" : ""}`}
                role="listitem"
              >
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

                <div className="match-card-actions">
                  <button
                    className={`availability-btn ${match.myStatus ? "available" : "not-available"}`}
                    onClick={() => toggleSelfAvailability(match)}
                    disabled={disableToggle || updatingPlayerIds.includes(currentUser?.id)}
                  >
                    {match.myStatus
                      ? disableToggle
                        ? "Available - Captain controls removal"
                        : "Make Unavailable"
                      : "Mark Available"}
                  </button>

                  <button
                    className="availability-btn secondary-btn"
                    onClick={() => setSelectedMatchId(match.id)}
                  >
                    {isSelected ? "Viewing Roster" : "Manage Match Roster"}
                  </button>

                  {isCaptain && canCaptainManageMatch(match) && isMatchOnOrBeforeToday(match.matchDate) && (
                    <button
                      className="availability-btn"
                      onClick={() => handleMarkCompleted(match.id)}
                      disabled={completingMatchId === match.id}
                    >
                      {completingMatchId === match.id ? "Marking Completed..." : "Mark Completed"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {hasTeamMembership && (
        <section className="squad-panel">
          <div className="section-heading squad-heading">
            <div>
              <h2>Match Availability Manager</h2>
              <p>
                {selectedMatch
                  ? `${selectedMatch.teamA} vs ${selectedMatch.teamB} on ${formatMatchDate(selectedMatch.matchDate)}`
                  : "Choose a match to view player availability"}
              </p>
            </div>
            {selectedMatch && (
              <div className="squad-count">
                {selectedMatch.availableCount}/{MAX_PLAYERS} available
              </div>
            )}
          </div>

          {selectedMatch && !loadingMatchPlayers && selectedMatchPlayers.length > 0 && (
            <div className="roster-filters">
              <button
                type="button"
                className={`filter-chip ${showMyTeamOnly ? "active" : ""}`}
                onClick={() => setShowMyTeamOnly((value) => !value)}
              >
                My Team Only
              </button>
              <button
                type="button"
                className={`filter-chip ${showAvailableOnly ? "active" : ""}`}
                onClick={() => setShowAvailableOnly((value) => !value)}
              >
                Available Only
              </button>
            </div>
          )}

          {!selectedMatch ? (
            <div className="empty-state">No upcoming match found.</div>
          ) : loadingMatchPlayers ? (
            <div className="empty-state">Loading match players...</div>
          ) : selectedMatchPlayers.length === 0 ? (
            <div className="empty-state">No players are assigned to the teams in this match yet.</div>
          ) : !hasVisibleRosterPlayers ? (
            <div className="empty-state">No players match the current filters.</div>
          ) : (
            <div className="team-roster-groups">
              {groupedSelectedMatchPlayers.map((group) => (
                <section key={group.teamName} className="team-roster-group">
                  <div className="team-roster-header">
                    <div>
                      <h3>{group.teamName}</h3>
                      <p>{group.players.filter((player) => player.available).length} players available</p>
                    </div>
                    <div className="team-roster-badge">{group.players.length} players</div>
                  </div>

                  {group.players.length === 0 ? (
                    <div className="empty-state">No players found for this team with the current filters.</div>
                  ) : (
                    <div className="roster-grid">
                      {group.players.map((player) => {
                        const canManagePlayer = canCaptainManagePlayer(player);
                        const isSelf = player.id === currentUser?.id;
                        const isUpdating = updatingPlayerIds.includes(player.id);
                        const canToggleSelf = isSelf && (!player.available || isCaptain);
                        const canToggle = canManagePlayer || canToggleSelf;

                        return (
                          <div key={player.id} className={`roster-card ${player.available ? "is-available" : ""}`}>
                            <div className="roster-card-top">
                              <div>
                                <div className="squad-player-name">{player.name || player.mobile}</div>
                                <div className="squad-player-meta">
                                  {player.teamRole ? `${player.teamRole}` : "TEAM PLAYER"}
                                  {player.playerRole ? ` | ${player.playerRole}` : ""}
                                </div>
                              </div>
                              <span className={`availability-pill ${player.available ? "active" : "inactive"}`}>
                                {player.available ? "Available" : "Not Available"}
                              </span>
                            </div>

                            <div className="roster-player-mobile">{player.mobile}</div>

                            <button
                              className={`availability-btn ${player.available ? "available" : "not-available"}`}
                              onClick={() => handleRosterAvailabilityToggle(player)}
                              disabled={!canToggle || isUpdating}
                            >
                              {isUpdating
                                ? "Saving..."
                                : player.available
                                  ? canManagePlayer || canToggleSelf
                                    ? "Mark Unavailable"
                                    : "Managed by Captain"
                                  : canManagePlayer
                                    ? "Mark Available"
                                    : isSelf
                                      ? "Mark Available"
                                      : "Captain Can Mark Available"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </section>
      )}

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
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
