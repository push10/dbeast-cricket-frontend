import React, { useState } from "react";
import { Box, Button, Input, VStack } from "@chakra-ui/react";
import axios from "axios";

const API_BASE = "http://localhost:8080/api/matches";

export default function CreateMatch() {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [matchDate, setMatchDate] = useState("");

  const createMatch = async () => {
    if (!teamA || !teamB || !matchDate) {
      alert("All fields are required!");
      return;
    }

    try {
      const payload = { teamA: teamA.trim(), teamB: teamB.trim(), matchDate };

      const res = await axios.post(API_BASE, payload, {
        headers: { "Content-Type": "application/json" },
      });

      alert(`Match created: ${res.data.teamA} vs ${res.data.teamB}`);
      setTeamA("");
      setTeamB("");
      setMatchDate("");
    } catch (err) {
      console.error(err);
      alert("Error creating match. Make sure backend is running and CORS is enabled.");
    }
  };

  return (
    <VStack spacing={5} align="stretch" p={5}>
      <Box>
        <VStack spacing={3} align="start">
          <Input
            placeholder="Team A"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
          />
          <Input
            placeholder="Team B"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
          />
          <Input
            type="date"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
          />
          <Button colorScheme="blue" onClick={createMatch}>
            Create Match
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}