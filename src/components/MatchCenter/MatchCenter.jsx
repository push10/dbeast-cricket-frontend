import { useState } from "react";
import "./matchcenter.css";

export default function MatchCenter() {

  const [matches, setMatches] = useState([
    {
      id: 1,
      date: "15 Mar 2026",
      opponent: "Royal Strikers",
      ground: "City Cricket Ground",
      availableCount: 8,
      myStatus: false
    },
    {
      id: 2,
      date: "20 Mar 2026",
      opponent: "Knight Riders",
      ground: "Green Park",
      availableCount: 11,
      myStatus: true
    }
  ]);

  const toggleAvailability = (id) => {
    setMatches(matches.map(match => {

      if (match.id === id) {

        const newStatus = !match.myStatus;

        let newCount = match.availableCount;

        if (newStatus) newCount++;
        else newCount--;

        return {
          ...match,
          myStatus: newStatus,
          availableCount: newCount
        };
      }

      return match;
    }));
  };

  const getRowClass = (count) => {
    if (count >= 11) return "row-green";
    return "row-yellow";
  };

  return (
    <div className="match-center">

      <h2>🏏 Match Center</h2>

      <table className="match-table">

        <thead>
          <tr>
            <th>Date</th>
            <th>Opponent</th>
            <th>Ground</th>
            <th>Players Available</th>
            <th>Your Status</th>
          </tr>
        </thead>

        <tbody>

          {matches.map(match => (

            <tr key={match.id} className={getRowClass(match.availableCount)}>

              <td>{match.date}</td>
              <td>{match.opponent}</td>
              <td>{match.ground}</td>

              <td>
                {match.availableCount}/11
              </td>

              <td>

                <button
                  className={
                    match.myStatus
                      ? "btn-available"
                      : "btn-notavailable"
                  }
                  onClick={() => toggleAvailability(match.id)}
                >
                  {match.myStatus ? "Available" : "Not Available"}
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}