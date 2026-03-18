import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Input, Button, VStack, Heading, Text } from "@chakra-ui/react";
import { createMatch } from "../../api/matchApi";

export default function CreateMatch({ currentUser }) {
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();

  const myTeamName = useMemo(() => {
    const captainTeam = currentUser?.teams?.find((team) => team.role === "CAPTAIN");
    return captainTeam?.teamName || currentUser?.teams?.[0]?.teamName || "My Team";
  }, [currentUser]);

  const handleCreate = async () => {
    if (!opponent || !date) {
      alert("Please fill all fields");
      return;
    }

    try {
      await createMatch({
        teamA: myTeamName,
        teamB: opponent.trim(),
        matchDate: date,
      });

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

        <Box width="full" p={3} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" color="gray.500">
            Team Creating Match
          </Text>
          <Text fontWeight="semibold">{myTeamName}</Text>
        </Box>

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

        <Button colorScheme="blue" width="full" onClick={handleCreate}>
          Create Match
        </Button>
      </VStack>
    </Box>
  );
}
