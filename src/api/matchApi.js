import apiClient from "./apiClient";

// Get all matches
export const getMatches = async () => {
  const res = await apiClient.get("/matches");
  return res.data;
};

// Create new match
export const createMatch = async (match) => {
  const res = await apiClient.post("/matches", match);
  return res.data;
};

// Update player availability
export const updateAvailability = async (matchId, playerId, available) => {
  const res = await apiClient.post(
    `/matches/${matchId}/availability`,
    null,
    {
      params: { playerId, available }
    }
  );

  return res.data;
};