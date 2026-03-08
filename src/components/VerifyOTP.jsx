// VerifyOTP.jsx
import React, { useState } from "react";
import { Box, Input, Button, VStack, Text } from "@chakra-ui/react";

export default function VerifyOTP({ mobile, onVerify }) {
  const [otp, setOtp] = useState("");
  return (
    <Box maxW="sm" mx="auto" mt={20} p={6} borderWidth={1} borderRadius="md">
      <VStack spacing={4} align="stretch">
        <Text>Enter OTP sent to {mobile}</Text>
        <Input
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button colorScheme="blue" onClick={onVerify}>
          Verify
        </Button>
      </VStack>
    </Box>
  );
}