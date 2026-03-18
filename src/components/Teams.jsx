import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { addPlayerToTeam, createTeam, getTeam } from "../api/teamApi";
import { getMyProfile } from "../api/authApi";
import { setCurrentUser } from "../api/auth";
import { isValidMobile } from "../utils/validation";
import { getApiFieldErrors, getApiErrorMessage } from "../utils/apiErrors";

export default function Teams({ currentUser, setUser }) {
  const [teamName, setTeamName] = useState("");
  const [playerMobile, setPlayerMobile] = useState("");
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [createTeamErrors, setCreateTeamErrors] = useState({});
  const [createTeamError, setCreateTeamError] = useState("");
  const [addPlayerErrors, setAddPlayerErrors] = useState({});
  const [addPlayerError, setAddPlayerError] = useState("");

  const captainTeam = useMemo(
    () => teams.find((team) => team.role === "CAPTAIN") || null,
    [teams]
  );

  useEffect(() => {
    refreshProfileTeams();
  }, []);

  const refreshProfileTeams = async () => {
    try {
      const profile = await getMyProfile();
      setTeams(profile.teams || []);
      const nextUser = { ...profile, token: currentUser?.token };
      setCurrentUser(nextUser);
      setUser(nextUser);

      if (profile.teams?.length) {
        const captainMembership = profile.teams.find((team) => team.role === "CAPTAIN");
        const initialTeam = captainMembership?.teamId || profile.teams[0].teamId;
        await loadTeam(initialTeam);
      } else {
        setActiveTeam(null);
      }
    } catch (err) {
      console.error("Failed to load teams", err);
    }
  };

  const loadTeam = async (teamId) => {
    try {
      const data = await getTeam(teamId);
      setActiveTeam(data);
    } catch (err) {
      console.error("Failed to load team details", err);
    }
  };

  const handleCreateTeam = async () => {
    const trimmedTeamName = teamName.trim();
    const nextErrors = {};

    setCreateTeamError("");

    if (trimmedTeamName.length < 3) {
      nextErrors.teamName = "Team name must be at least 3 characters";
    }

    if (Object.keys(nextErrors).length > 0) {
      setCreateTeamErrors(nextErrors);
      return;
    }

    setCreateTeamErrors({});

    try {
      const created = await createTeam(trimmedTeamName);
      setTeamName("");
      setActiveTeam(created);
      await refreshProfileTeams();
    } catch (err) {
      console.error("Failed to create team", err);
      setCreateTeamErrors(getApiFieldErrors(err));
      setCreateTeamError(getApiErrorMessage(err, "Could not create team"));
    }
  };

  const handleAddPlayer = async () => {
    if (!captainTeam) {
      setAddPlayerError("Create a team first");
      return;
    }

    const trimmedMobile = playerMobile.trim();
    const nextErrors = {};

    setAddPlayerError("");

    if (!isValidMobile(trimmedMobile)) {
      nextErrors.mobile = "Enter a valid 10-digit Indian mobile number";
    }

    if (Object.keys(nextErrors).length > 0) {
      setAddPlayerErrors(nextErrors);
      return;
    }

    setAddPlayerErrors({});

    try {
      const updatedTeam = await addPlayerToTeam(captainTeam.teamId, trimmedMobile);
      setPlayerMobile("");
      setActiveTeam(updatedTeam);
      await refreshProfileTeams();
    } catch (err) {
      console.error("Failed to add player", err);
      setAddPlayerErrors(getApiFieldErrors(err));
      setAddPlayerError(getApiErrorMessage(err, "Could not add player to team"));
    }
  };

  return (
    <Stack spacing={6}>
      <Box>
        <Heading size="lg">Teams</Heading>
        <Text color="gray.600">
          Captains can create a team and add registered players by mobile number.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Box borderWidth={1} borderRadius="lg" p={6}>
          <Heading size="md" mb={4}>Create Team</Heading>
          <Stack spacing={4}>
            {createTeamError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {createTeamError}
              </Alert>
            )}

            <FormControl isInvalid={Boolean(createTeamErrors.teamName)}>
              <FormLabel>Team Name</FormLabel>
              <Input
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setCreateTeamErrors((prev) => ({ ...prev, teamName: undefined }));
                }}
              />
              <FormErrorMessage>{createTeamErrors.teamName}</FormErrorMessage>
            </FormControl>

            <Button colorScheme="blue" onClick={handleCreateTeam}>
              Create Team
            </Button>
          </Stack>
        </Box>

        <Box borderWidth={1} borderRadius="lg" p={6}>
          <Heading size="md" mb={4}>Add Player To My Team</Heading>
          <Stack spacing={4}>
            {addPlayerError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {addPlayerError}
              </Alert>
            )}

            <FormControl isInvalid={Boolean(addPlayerErrors.mobile)}>
              <FormLabel>Player Mobile Number</FormLabel>
              <Input
                value={playerMobile}
                maxLength={10}
                onChange={(e) => {
                  setPlayerMobile(e.target.value);
                  setAddPlayerErrors((prev) => ({ ...prev, mobile: undefined }));
                }}
              />
              <FormErrorMessage>{addPlayerErrors.mobile}</FormErrorMessage>
            </FormControl>

            <Button colorScheme="green" onClick={handleAddPlayer} isDisabled={!captainTeam}>
              Add Player
            </Button>

            {!captainTeam && (
              <Text fontSize="sm" color="gray.500">
                You become captain after creating a team.
              </Text>
            )}
          </Stack>
        </Box>
      </SimpleGrid>

      <Box borderWidth={1} borderRadius="lg" p={6}>
        <Heading size="md" mb={4}>My Team Memberships</Heading>
        <Stack spacing={3}>
          {teams.length === 0 ? (
            <Text color="gray.500">No team memberships yet.</Text>
          ) : (
            teams.map((team) => (
              <Button
                key={team.teamId}
                justifyContent="space-between"
                variant="outline"
                onClick={() => loadTeam(team.teamId)}
              >
                <span>{team.teamName}</span>
                <span>{team.role}</span>
              </Button>
            ))
          )}
        </Stack>
      </Box>

      <Box borderWidth={1} borderRadius="lg" p={6}>
        <Heading size="md" mb={4}>
          {activeTeam ? `${activeTeam.teamName} Players` : "Team Players"}
        </Heading>
        <Stack spacing={3}>
          {!activeTeam ? (
            <Text color="gray.500">Select a team to view players.</Text>
          ) : activeTeam.players.length === 0 ? (
            <Text color="gray.500">No players in this team yet.</Text>
          ) : (
            activeTeam.players.map((player) => (
              <Box key={player.id} borderWidth={1} borderRadius="md" p={3}>
                <Text fontWeight="semibold">{player.name}</Text>
                <Text fontSize="sm" color="gray.600">{player.mobile}</Text>
                <Text fontSize="sm" color="gray.600">
                  {player.teamRole} {player.playerRole ? `| ${player.playerRole}` : ""}
                </Text>
              </Box>
            ))
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
