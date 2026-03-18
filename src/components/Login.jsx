import React, { useState } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import { useNavigate, Link } from "react-router-dom";
import { getMyProfile, loginPlayer, persistSession, sendOtp } from "../api/authApi";
import { isValidMobile, isValidOtp } from "../utils/validation";
import { getApiFieldErrors, getApiErrorMessage } from "../utils/apiErrors";

export default function Login({ onLoginSuccess }) {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    const trimmedMobile = mobile.trim();
    const nextErrors = {};

    setFormError("");

    if (!isValidMobile(trimmedMobile)) {
      nextErrors.mobile = "Enter a valid 10-digit Indian mobile number";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});

    try {
      await sendOtp(trimmedMobile);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      setFieldErrors(getApiFieldErrors(err));
      setFormError(getApiErrorMessage(err, "Failed to send OTP"));
    }
  };

  const handleLogin = async () => {
    const trimmedMobile = mobile.trim();
    const trimmedOtp = otp.trim();
    const nextErrors = {};

    setFormError("");

    if (!isValidMobile(trimmedMobile)) {
      nextErrors.mobile = "Enter a valid 10-digit Indian mobile number";
    }

    if (!isValidOtp(trimmedOtp)) {
      nextErrors.otp = "Enter a valid 6-digit OTP";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});

    try {
      const loginResponse = await loginPlayer(trimmedMobile, trimmedOtp);
      const profile = await getMyProfile(loginResponse.token);

      persistSession(loginResponse, profile);
      onLoginSuccess({ ...profile, token: loginResponse.token });
      navigate("/matches");
    } catch (err) {
      console.error(err);
      setFieldErrors(getApiFieldErrors(err));
      setFormError(getApiErrorMessage(err, "Login failed"));
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="md">
      <VStack spacing={4}>
        <Heading size="md">Login</Heading>

        {formError && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {formError}
          </Alert>
        )}

        <FormControl isInvalid={Boolean(fieldErrors.mobile)}>
          <Input
            placeholder="Mobile Number"
            value={mobile}
            maxLength={10}
            onChange={(e) => {
              setMobile(e.target.value);
              setFieldErrors((prev) => ({ ...prev, mobile: undefined }));
            }}
          />
          <FormErrorMessage>{fieldErrors.mobile}</FormErrorMessage>
        </FormControl>

        {!otpSent && (
          <Button colorScheme="blue" onClick={handleSendOtp} width="full">
            Send OTP
          </Button>
        )}

        {otpSent && (
          <>
            <FormControl isInvalid={Boolean(fieldErrors.otp)}>
              <Input
                placeholder="Enter OTP"
                value={otp}
                maxLength={6}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, otp: undefined }));
                }}
              />
              <FormErrorMessage>{fieldErrors.otp}</FormErrorMessage>
            </FormControl>

            <Button colorScheme="green" onClick={handleLogin} width="full">
              Login
            </Button>
          </>
        )}

        <Link to="/register">New player? Register</Link>
      </VStack>
    </Box>
  );
}
