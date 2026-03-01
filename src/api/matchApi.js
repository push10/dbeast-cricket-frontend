// src/api/matchApi.js
import axios from "axios";

export const API_BASE = "http://localhost:8080/api/matches";

export const createMatch = async (match) => {
  const response = await axios.post(API_BASE, match);
  return response.data;
};

export const getMatches = async () => {
  const response = await axios.get(API_BASE);
  return response.data;
};