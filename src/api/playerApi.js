import apiClient from "./apiClient";

export const sendOtp = async (mobile) => {
  const res = await apiClient.post("/players/send-otp", { mobile });
  return res.data;
};

export const loginPlayer = async (mobile, otp) => {
  const res = await apiClient.post("/players/login", {
    mobile,
    otp,
  });
  return res.data;
};

export const registerPlayer = async (data) => {
  const res = await apiClient.post("/players/register", data);
  return res.data;
};