import axios from "axios";

const BASE_URL = "http://localhost:8080/api/players";

// Send OTP
export const sendOtp = async (mobile) => {
  const res = await axios.post(`${BASE_URL}/send-otp`, { mobile });
  return res.data;
};

// Login with OTP
export const loginPlayer = async (mobile, otp) => {
  const res = await axios.post(`${BASE_URL}/login`, { mobile, otp });
  return res.data;
};

// Register new player
export const registerPlayer = async (player) => {
  const res = await axios.post(`${BASE_URL}/register`, player);
  return res.data;
};