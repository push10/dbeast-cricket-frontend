// src/components/MatchCenter/CreateMatch.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Input, Button, VStack, Heading } from "@chakra-ui/react";
import { createMatch } from "../../api/matchApi";

export default function CreateMatch({ currentUser }) {
  const [opponent, setOpponent] = useState("");
  const [ground, setGround] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!opponent || !ground || !date) {
      alert("Please fill all fields");
      return;
    }

    try {
      await createMatch({ opponent, ground, date });
      alert("Match created successfully!");
      navigate("/matches");
    } catch (err) {
      console.error("Failed to create match:", err);
      alert("Error creating match");
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="md">
      <VStack spacing={4}>
        <Heading size="md">Create New Match</Heading>
        <Input
          type="date"
          placeholder="Match Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          placeholder="Opponent Team"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
        />
        <Input
          placeholder="Ground"
          value={ground}
          onChange={(e) => setGround(e.target.value)}
        />
        <Button colorScheme="blue" width="full" onClick={handleCreate}>
          Create Match
        </Button>
      </VStack>
    </Box>
  );
}