import axios from "axios";

const API_BASE = "http://localhost:8080/api/players";
const MATCH_BASE = "http://localhost:8080/api/matches";

// -------------------- Player APIs --------------------

// Send OTP to mobile
export const sendOtp = async (mobile) => {
  const response = await axios.post(`${API_BASE}/send-otp`, { mobile });
  return response.data;
};

// Login with mobile + OTP
export const loginPlayer = async (mobile, otp) => {
  const response = await axios.post(`${API_BASE}/login`, { mobile, otp });
  return response.data; // should return player info and token if implemented
};

// Register a new player
export const registerPlayer = async (name, mobile, password) => {
  const response = await axios.post(`${API_BASE}/register`, { name, mobile, password });
  return response.data;
};

// -------------------- Match APIs --------------------

// Get all matches for current team
export const getMatches = async () => {
  const response = await axios.get(MATCH_BASE);
  return response.data;
};

// Mark current player as available or not
export const markAvailability = async (matchId, mobile, isAvailable) => {
  const response = await axios.post(`${MATCH_BASE}/${matchId}/availability`, {
    mobile,
    available: isAvailable,
  });
  return response.data;
};

export const updateAvailability = async (matchId, playerId, available) => {
  const res = await apiClient.post(
    `/matches/${matchId}/availability`,
    null,
    { params: { playerId, available } }
  );
  return res.data;
};