import { useState } from "react";
import { createMatch } from "../api/matchApi";

export default function MatchForm({ onMatchCreated }) {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const match = { teamA, teamB, matchDate };
      const result = await createMatch(match);
      onMatchCreated(result); // Notify parent
      setTeamA(""); setTeamB(""); setMatchDate("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Failed to create match");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{JSON.stringify(error)}</p>}
      <input
        type="text"
        placeholder="Team A"
        value={teamA}
        onChange={(e) => setTeamA(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Team B"
        value={teamB}
        onChange={(e) => setTeamB(e.target.value)}
        required
      />
      <input
        type="date"
        value={matchDate}
        onChange={(e) => setMatchDate(e.target.value)}
        required
      />
      <button type="submit">Create Match</button>
    </form>
  );
}