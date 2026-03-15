import React, { useState } from "react";
import { Box, Input, Button, VStack, Heading } from "@chakra-ui/react";
import { useNavigate, Link } from "react-router-dom";
import { sendOtp, loginPlayer } from "../api/authApi";

export default function Login({ onLoginSuccess }) {

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      await sendOtp(mobile);
      setOtpSent(true);
      alert("OTP sent");
    } catch (err) {
      alert("Failed to send OTP");
    }
  };

  const handleLogin = async () => {

    try {

      const data = await loginPlayer(mobile, otp);

      localStorage.setItem("token", data.token);

      onLoginSuccess(data);

      navigate("/matches");

    } catch (err) {
      alert("Invalid OTP");
    }

  };

  return (
    <Box maxW="sm" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="md">

      <VStack spacing={4}>

        <Heading size="md">Login</Heading>

        <Input
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        {!otpSent && (
          <Button colorScheme="blue" onClick={handleSendOtp} width="full">
            Send OTP
          </Button>
        )}

        {otpSent && (
          <>
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

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