import axios from "axios";
import apiClient from "./apiClient";
import { clearAuth, setCurrentUser, setToken } from "./auth";

const BASE_URL = "http://localhost:8080/api/players";

export const sendOtp = async (mobile) => {
  const res = await axios.post(`${BASE_URL}/send-otp`, { mobile });
  return res.data;
};

export const loginPlayer = async (mobile, otp) => {
  const res = await axios.post(`${BASE_URL}/login`, { mobile, otp });
  return res.data;
};

export const registerPlayer = async (player) => {
  const res = await axios.post(`${BASE_URL}/register`, player);
  return res.data;
};

export const getMyProfile = async (tokenOverride) => {
  const config = tokenOverride
    ? { headers: { Authorization: `Bearer ${tokenOverride}` } }
    : undefined;
  const res = await apiClient.get("/players/me", config);
  return res.data;
};

export const updateMyProfile = async (payload) => {
  const res = await apiClient.put("/players/me", payload);
  return res.data;
};

export const getMyWalletRechargeRequests = async () => {
  const res = await apiClient.get("/players/me/wallet/recharge-requests");
  return res.data;
};

export const createWalletRechargeRequest = async (payload) => {
  const res = await apiClient.post("/players/me/wallet/recharge-requests", payload);
  return res.data;
};

export const approveWalletRechargeRequest = async (requestId) => {
  const res = await apiClient.post(`/players/me/wallet/recharge-requests/${requestId}/approve`);
  return res.data;
};

export const persistSession = (loginResponse, profile) => {
  setToken(loginResponse.token);
  setCurrentUser({
    ...profile,
    token: loginResponse.token,
    userRole: profile.userRole || loginResponse.userRole,
  });
};

export const logoutPlayer = () => {
  clearAuth();
};
