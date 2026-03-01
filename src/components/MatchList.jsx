export default function MatchList({ matches }) {
  if (!matches || matches.length === 0) return <p>No matches yet</p>;

  return (
    <ul>
      {matches.map((m) => (
        <li key={m.id}>
          {m.teamA} vs {m.teamB} on {m.matchDate}
        </li>
      ))}
    </ul>
  );
}