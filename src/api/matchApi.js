import apiClient from "./apiClient";

// Get all matches
export const getMatches = async () => {
  const res = await apiClient.get("/matches");
  return res.data;
};

// Create a new match
export const createMatch = async (match) => {
  const res = await apiClient.post("/matches", match);
  return res.data;
};

// Update availability
export const updateAvailability = async (matchId, playerId, available) => {
  // Send available status and playerId as query params, not body
  const res = await apiClient.post(
    `/matches/${matchId}/availability`,
    null, // no body
    {
      params: { playerId, available },
    }
  );

  return res.data;
};