import apiClient from "./apiClient";

export const getMatches = async (playerId) => {
  const res = await apiClient.get("/matches", {
    params: { playerId },
  });

  return res.data;
};

export const getCompletedMatches = async (playerId) => {
  const res = await apiClient.get("/matches/completed", {
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

export const completeMatch = async (matchId) => {
  const res = await apiClient.post(`/matches/${matchId}/complete`);
  return res.data;
};

export const updateAvailability = async (matchId, playerId, available) => {
  const res = await apiClient.post(`/matches/${matchId}/availability`, null, {
    params: { playerId, available },
  });

  return res.data;
};

export const getMatchExpenses = async (matchId) => {
  const res = await apiClient.get(`/matches/${matchId}/expenses`);
  return res.data;
};

export const createMatchExpense = async (matchId, payload) => {
  const res = await apiClient.post(`/matches/${matchId}/expenses`, payload);
  return res.data;
};

export const getMatchFinanceOverview = async (matchId) => {
  const res = await apiClient.get(`/matches/${matchId}/finance`);
  return res.data;
};

export const recalculateMatchFinance = async (matchId) => {
  const res = await apiClient.post(`/matches/${matchId}/finance/recalculate`);
  return res.data;
};

export const upsertMatchContribution = async (matchId, payload) => {
  const res = await apiClient.post(`/matches/${matchId}/contributions`, payload);
  return res.data;
};
