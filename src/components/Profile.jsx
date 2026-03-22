import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  approveWalletRechargeRequest,
  createWalletRechargeRequest,
  getMyProfile,
  getMyWalletRechargeRequests,
  updateMyProfile,
} from "../api/authApi";
import { setCurrentUser } from "../api/auth";
import { getTeam } from "../api/teamApi";
import { isValidEmail, isValidHttpUrl } from "../utils/validation";
import { getApiFieldErrors, getApiErrorMessage } from "../utils/apiErrors";

const EMPTY_FORM = {
  name: "",
  email: "",
  dateOfBirth: "",
  address: "",
  profileImageUrl: "",
  playerRole: "",
};

const EMPTY_RECHARGE_FORM = {
  amount: "",
  description: "",
};

const EMPTY_DEMAND_FORM = {
  playerId: "",
  amount: "",
  description: "",
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Pending";

export default function Profile({ currentUser, setUser }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [wallet, setWallet] = useState(null);
  const [teams, setTeams] = useState([]);
  const [rechargeRequests, setRechargeRequests] = useState([]);
  const [captainPlayers, setCaptainPlayers] = useState([]);
  const [rechargeForm, setRechargeForm] = useState(EMPTY_RECHARGE_FORM);
  const [demandForm, setDemandForm] = useState(EMPTY_DEMAND_FORM);
  const [saving, setSaving] = useState(false);
  const [savingRecharge, setSavingRecharge] = useState(false);
  const [savingDemand, setSavingDemand] = useState(false);
  const [approvingRequestId, setApprovingRequestId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  const isCaptain = currentUser?.userRole === "CAPTAIN";

  const captainTeamMemberships = useMemo(
    () => teams.filter((team) => team.role === "CAPTAIN"),
    [teams]
  );

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    async function loadCaptainPlayers() {
      if (!captainTeamMemberships.length) {
        setCaptainPlayers([]);
        return;
      }

      try {
        const teamResponses = await Promise.all(
          captainTeamMemberships.map((team) => getTeam(team.teamId))
        );

        const mappedPlayers = [];
        teamResponses.forEach((teamResponse) => {
          (teamResponse.players || []).forEach((player) => {
            mappedPlayers.push({
              id: player.id,
              name: player.name || player.mobile,
              mobile: player.mobile,
              teamName: teamResponse.teamName,
            });
          });
        });

        const uniquePlayers = mappedPlayers.filter(
          (player, index, array) => array.findIndex((item) => item.id === player.id) === index
        );

        setCaptainPlayers(uniquePlayers);
        setDemandForm((prev) => ({
          ...prev,
          playerId: prev.playerId || String(uniquePlayers[0]?.id || ""),
        }));
      } catch (err) {
        console.error("Failed to load captain team players", err);
      }
    }

    loadCaptainPlayers();
  }, [captainTeamMemberships]);

  const loadProfileData = async () => {
    try {
      const [profile, requests] = await Promise.all([getMyProfile(), getMyWalletRechargeRequests()]);
      syncProfile(profile);
      setRechargeRequests(requests);
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  const refreshWalletData = async () => {
    const [profile, requests] = await Promise.all([getMyProfile(), getMyWalletRechargeRequests()]);
    syncProfile(profile);
    setRechargeRequests(requests);
  };

  const syncProfile = (profile) => {
    setForm({
      name: profile.name || "",
      email: profile.email || "",
      dateOfBirth: profile.dateOfBirth || "",
      address: profile.address || "",
      profileImageUrl: profile.profileImageUrl || "",
      playerRole: profile.playerRole || "",
    });
    setWallet(profile.wallet || null);
    setTeams(profile.teams || []);
    const nextUser = { ...profile, token: currentUser?.token };
    setCurrentUser(nextUser);
    setUser(nextUser);
  };

  const clearFieldError = (field) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const handleRechargeFormChange = (event) => {
    const { name, value } = event.target;
    setRechargeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDemandFormChange = (event) => {
    const { name, value } = event.target;
    setDemandForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedAddress = form.address.trim();
    const trimmedProfileImageUrl = form.profileImageUrl.trim();
    const nextErrors = {};

    setFormError("");

    if (trimmedName.length < 2) {
      nextErrors.name = "Name must be at least 2 characters";
    }

    if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (form.dateOfBirth && new Date(form.dateOfBirth) >= new Date()) {
      nextErrors.dateOfBirth = "Date of birth must be in the past";
    }

    if (!isValidHttpUrl(trimmedProfileImageUrl)) {
      nextErrors.profileImageUrl = "Profile image URL must start with http:// or https://";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setSaving(true);

    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail || null,
        dateOfBirth: form.dateOfBirth || null,
        address: trimmedAddress || null,
        profileImageUrl: trimmedProfileImageUrl || null,
        playerRole: form.playerRole || null,
      };

      const updated = await updateMyProfile(payload);
      syncProfile(updated);
    } catch (err) {
      console.error("Failed to update profile", err);
      setFieldErrors(getApiFieldErrors(err));
      setFormError(getApiErrorMessage(err, "Could not update profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRechargeRequest = async () => {
    if (!rechargeForm.amount) {
      setFormError("Recharge amount is required");
      return;
    }

    setSavingRecharge(true);
    setFormError("");

    try {
      await createWalletRechargeRequest({
        amount: Number(rechargeForm.amount),
        description: rechargeForm.description.trim() || null,
      });
      setRechargeForm(EMPTY_RECHARGE_FORM);
      await refreshWalletData();
    } catch (err) {
      console.error("Failed to create recharge request", err);
      setFormError(getApiErrorMessage(err, "Could not submit recharge request"));
    } finally {
      setSavingRecharge(false);
    }
  };

  const handleCreateDemand = async () => {
    if (!demandForm.playerId || !demandForm.amount) {
      setFormError("Player and amount are required for a recharge demand");
      return;
    }

    setSavingDemand(true);
    setFormError("");

    try {
      await createWalletRechargeRequest({
        playerId: Number(demandForm.playerId),
        amount: Number(demandForm.amount),
        description: demandForm.description.trim() || null,
      });
      setDemandForm((prev) => ({
        playerId: prev.playerId,
        amount: "",
        description: "",
      }));
      await refreshWalletData();
    } catch (err) {
      console.error("Failed to create recharge demand", err);
      setFormError(getApiErrorMessage(err, "Could not raise recharge demand"));
    } finally {
      setSavingDemand(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    setApprovingRequestId(requestId);
    setFormError("");

    try {
      await approveWalletRechargeRequest(requestId);
      await refreshWalletData();
    } catch (err) {
      console.error("Failed to approve recharge request", err);
      setFormError(getApiErrorMessage(err, "Could not approve recharge request"));
    } finally {
      setApprovingRequestId(null);
    }
  };

  return (
    <Stack spacing={6}>
      <Box>
        <Heading size="lg">Player Profile</Heading>
        <Text color="gray.600">
          Keep your details up to date, request wallet recharge, and manage captain approvals.
        </Text>
      </Box>

      {formError && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {formError}
        </Alert>
      )}

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        <GridItem>
          <Box borderWidth={1} borderRadius="lg" p={6}>
            <Stack spacing={4}>
              <FormControl isInvalid={Boolean(fieldErrors.name)}>
                <FormLabel>Name</FormLabel>
                <Input name="name" value={form.name} onChange={handleChange} />
                <FormErrorMessage>{fieldErrors.name}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Mobile</FormLabel>
                <Input value={currentUser?.mobile || ""} isReadOnly />
              </FormControl>

              <FormControl isInvalid={Boolean(fieldErrors.email)}>
                <FormLabel>Email</FormLabel>
                <Input name="email" value={form.email} onChange={handleChange} />
                <FormErrorMessage>{fieldErrors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(fieldErrors.dateOfBirth)}>
                <FormLabel>Date Of Birth</FormLabel>
                <Input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
                <FormErrorMessage>{fieldErrors.dateOfBirth}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(fieldErrors.address)}>
                <FormLabel>Address</FormLabel>
                <Input name="address" value={form.address} onChange={handleChange} />
                <FormErrorMessage>{fieldErrors.address}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(fieldErrors.profileImageUrl)}>
                <FormLabel>Profile Image URL</FormLabel>
                <Input name="profileImageUrl" value={form.profileImageUrl} onChange={handleChange} />
                <FormErrorMessage>{fieldErrors.profileImageUrl}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={Boolean(fieldErrors.playerRole)}>
                <FormLabel>Playing Role</FormLabel>
                <Select name="playerRole" value={form.playerRole} onChange={handleChange}>
                  <option value="">Select role</option>
                  <option value="BATSMAN">Batsman</option>
                  <option value="BOWLER">Bowler</option>
                  <option value="ALLROUNDER">All Rounder</option>
                  <option value="WICKET_KEEPER">Wicket Keeper</option>
                </Select>
                <FormErrorMessage>{fieldErrors.playerRole}</FormErrorMessage>
              </FormControl>

              <Button colorScheme="blue" onClick={handleSave} isLoading={saving} alignSelf="start">
                Save Profile
              </Button>
            </Stack>
          </Box>
        </GridItem>

        <GridItem>
          <Stack spacing={4}>
            <Box borderWidth={1} borderRadius="lg" p={6}>
              <Text fontSize="sm" color="gray.500">Wallet Balance</Text>
              <Heading size="lg">{formatCurrency(wallet?.balance)}</Heading>
              <Text mt={2} fontSize="sm" color="gray.600">
                Recharge requests reflect in wallet only after captain approval.
              </Text>
            </Box>

            <Box borderWidth={1} borderRadius="lg" p={6}>
              <Heading size="md" mb={4}>Recharge Wallet</Heading>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={rechargeForm.amount}
                    onChange={handleRechargeFormChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Input
                    name="description"
                    placeholder="Cash, UPI, match collection"
                    value={rechargeForm.description}
                    onChange={handleRechargeFormChange}
                  />
                </FormControl>
                <Button colorScheme="green" onClick={handleCreateRechargeRequest} isLoading={savingRecharge}>
                  Submit Recharge Request
                </Button>
              </Stack>
            </Box>

            {isCaptain && (
              <Box borderWidth={1} borderRadius="lg" p={6}>
                <Heading size="md" mb={4}>Raise Recharge Demand</Heading>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Player</FormLabel>
                    <Select
                      name="playerId"
                      value={demandForm.playerId}
                      onChange={handleDemandFormChange}
                      placeholder={captainPlayers.length ? "Select player" : "No captain players found"}
                    >
                      {captainPlayers.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name} - {player.teamName}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Amount</FormLabel>
                    <Input
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={demandForm.amount}
                      onChange={handleDemandFormChange}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Input
                      name="description"
                      placeholder="Ask player to recharge for upcoming match"
                      value={demandForm.description}
                      onChange={handleDemandFormChange}
                    />
                  </FormControl>
                  <Button colorScheme="orange" onClick={handleCreateDemand} isLoading={savingDemand}>
                    Raise Demand
                  </Button>
                </Stack>
              </Box>
            )}

            <Box borderWidth={1} borderRadius="lg" p={6}>
              <Heading size="md" mb={4}>My Teams</Heading>
              <Stack spacing={3}>
                {teams.length === 0 ? (
                  <Text color="gray.500">You are not part of any team yet.</Text>
                ) : (
                  teams.map((team) => (
                    <Box key={team.teamId} borderWidth={1} borderRadius="md" p={3}>
                      <Text fontWeight="semibold">{team.teamName}</Text>
                      <Text fontSize="sm" color="gray.600">{team.role}</Text>
                    </Box>
                  ))
                )}
              </Stack>
            </Box>
          </Stack>
        </GridItem>
      </Grid>

      <Box borderWidth={1} borderRadius="lg" p={6}>
        <Heading size="md" mb={4}>Recharge Requests</Heading>
        {!rechargeRequests.length ? (
          <Text color="gray.500">No recharge requests yet.</Text>
        ) : (
          <Stack spacing={3}>
            {rechargeRequests.map((request) => {
              const canApprove = isCaptain && request.status === "PENDING";
              return (
                <Box key={request.id} borderWidth={1} borderRadius="md" p={4}>
                  <Stack
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    spacing={4}
                  >
                    <Box>
                      <Stack direction="row" spacing={2} align="center" mb={1}>
                        <Text fontWeight="semibold">{request.playerName}</Text>
                        <Badge colorScheme={request.status === "APPROVED" ? "green" : "orange"}>
                          {request.status}
                        </Badge>
                        <Badge colorScheme={request.requestType === "CAPTAIN_DEMAND" ? "purple" : "blue"}>
                          {request.requestType === "CAPTAIN_DEMAND" ? "Captain Demand" : "Recharge Request"}
                        </Badge>
                      </Stack>
                      <Text>{formatCurrency(request.amount)}</Text>
                      {request.description && (
                        <Text fontSize="sm" color="gray.600">{request.description}</Text>
                      )}
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Raised by {request.requestedByName} on {formatDate(request.requestDate)}
                        {request.approvedDate ? ` | Approved on ${formatDate(request.approvedDate)}` : ""}
                      </Text>
                    </Box>

                    {canApprove && (
                      <Button
                        colorScheme="green"
                        onClick={() => handleApproveRequest(request.id)}
                        isLoading={approvingRequestId === request.id}
                      >
                        Approve Recharge
                      </Button>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
