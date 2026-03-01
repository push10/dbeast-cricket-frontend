import { useEffect, useState } from "react";
import { getMatches } from "./api/matchApi";
import MatchForm from "./components/MatchForm";
import MatchList from "./components/MatchList";

export default function App() {
  const [matches, setMatches] = useState([]);

  const fetchMatches = async () => {
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (err) {
      console.error("Failed to fetch matches", err);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleMatchCreated = (newMatch) => {
    setMatches((prev) => [...prev, newMatch]);
  };

  return (
    <div>
      <h1>D-Beast Matches</h1>
      <MatchForm onMatchCreated={handleMatchCreated} />
      <hr />
      <MatchList matches={matches} />
    </div>
  );
}