import apiClient from "./apiClient";

export const getMatches = async () => {

  const res = await apiClient.get("/matches");

  return res.data;

};

export const createMatch = async (match) => {

  const res = await apiClient.post("/matches", match);

  return res.data;

};

export const updateAvailability = async (matchId, available) => {

  const res = await apiClient.post(`/matches/${matchId}/availability`, {
    available
  });

  return res.data;
};