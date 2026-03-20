import apiClient from "./apiClient";

export const getMatches = async (playerId) => {
  const res = await apiClient.get("/matches", {
    params: { playerId },
  });

  return res.data;
};

export const getNextMatchSquad = async () => {
  const res = await apiClient.get("/matches/next-squad");
  return res.data;
};

export const createMatch = async (match) => {
  const res = await apiClient.post("/matches", match);
  return res.data;
};

export const updateAvailability = async (matchId, playerId, available) => {
  const res = await apiClient.post(`/matches/${matchId}/availability`, null, {
    params: { playerId, available },
  });

  return res.data;
};
