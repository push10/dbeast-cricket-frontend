import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Input, Button, VStack, Heading, Text, Select } from "@chakra-ui/react";
import { createMatch } from "../../api/matchApi";

export default function CreateMatch({ currentUser }) {
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const navigate = useNavigate();

  const captainTeams = useMemo(() => {
    return (currentUser?.teams || []).filter((team) => team.role === "CAPTAIN");
  }, [currentUser]);

  useEffect(() => {
    if (!captainTeams.length) {
      setSelectedTeamId("");
      return;
    }

    setSelectedTeamId((currentSelectedTeamId) => {
      if (
        currentSelectedTeamId &&
        captainTeams.some((team) => String(team.teamId) === currentSelectedTeamId)
      ) {
        return currentSelectedTeamId;
      }

      return String(captainTeams[0].teamId);
    });
  }, [captainTeams]);

  const selectedTeam = useMemo(() => {
    return captainTeams.find((team) => String(team.teamId) === selectedTeamId) || null;
  }, [captainTeams, selectedTeamId]);

  const handleCreate = async () => {
    if (!selectedTeam || !opponent || !date) {
      alert("Please fill all fields");
      return;
    }

    try {
      await createMatch({
        teamId: selectedTeam.teamId,
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
          {captainTeams.length ? (
            <Select
              mt={2}
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              bg="white"
            >
              {captainTeams.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </option>
              ))}
            </Select>
          ) : (
            <Text mt={2} color="red.500" fontWeight="medium">
              Create a team first to schedule a match.
            </Text>
          )}
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

        <Button
          colorScheme="blue"
          width="full"
          onClick={handleCreate}
          isDisabled={!captainTeams.length}
        >
          Create Match
        </Button>
      </VStack>
    </Box>
  );
}
