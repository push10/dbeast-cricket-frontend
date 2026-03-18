import { useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
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
import { getMyProfile, updateMyProfile } from "../api/authApi";
import { setCurrentUser } from "../api/auth";
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

export default function Profile({ currentUser, setUser }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [wallet, setWallet] = useState(null);
  const [teams, setTeams] = useState([]);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getMyProfile();
        syncProfile(profile);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    }

    loadProfile();
  }, []);

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

  return (
    <Stack spacing={6}>
      <Box>
        <Heading size="lg">Player Profile</Heading>
        <Text color="gray.600">
          Keep your details up to date for team selection and wallet tracking.
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
                <Input
                  name="profileImageUrl"
                  value={form.profileImageUrl}
                  onChange={handleChange}
                />
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
              <Heading size="lg">Rs. {wallet?.balance?.toFixed?.(2) ?? "0.00"}</Heading>
            </Box>

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
    </Stack>
  );
}
