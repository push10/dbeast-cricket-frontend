import apiClient from "./apiClient";

export const createTeam = async (teamName) => {
  const res = await apiClient.post("/teams", { teamName });
  return res.data;
};

export const getTeam = async (teamId) => {
  const res = await apiClient.get(`/teams/${teamId}`);
  return res.data;
};

export const getAvailablePlayersForTeam = async (teamId) => {
  const res = await apiClient.get(`/teams/${teamId}/available-players`);
  return res.data;
};

export const addPlayerToTeam = async (teamId, mobile) => {
  const res = await apiClient.post(`/teams/${teamId}/players`, { mobile });
  return res.data;
};
