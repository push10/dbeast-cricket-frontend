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
import { useNavigate } from "react-router-dom";
import { registerPlayer } from "../api/authApi";
import { isValidMobile } from "../utils/validation";
import { getApiFieldErrors, getApiErrorMessage } from "../utils/apiErrors";

export default function Register() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    const nextErrors = {};

    setFormError("");

    if (trimmedName.length < 2) {
      nextErrors.name = "Name must be at least 2 characters";
    }

    if (!isValidMobile(trimmedMobile)) {
      nextErrors.mobile = "Enter a valid 10-digit Indian mobile number";
    }

    if (password && password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});

    try {
      await registerPlayer({
        name: trimmedName,
        mobile: trimmedMobile,
        password: password.trim(),
      });

      navigate("/login");
    } catch (err) {
      console.error(err);
      setFieldErrors(getApiFieldErrors(err));
      setFormError(getApiErrorMessage(err, "Registration failed"));
    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="md">
      <VStack spacing={4}>
        <Heading size="md">Register</Heading>

        {formError && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {formError}
          </Alert>
        )}

        <FormControl isInvalid={Boolean(fieldErrors.name)}>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldErrors((prev) => ({ ...prev, name: undefined }));
            }}
          />
          <FormErrorMessage>{fieldErrors.name}</FormErrorMessage>
        </FormControl>

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

        <FormControl isInvalid={Boolean(fieldErrors.password)}>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
          />
          <FormErrorMessage>{fieldErrors.password}</FormErrorMessage>
        </FormControl>

        <Button colorScheme="green" onClick={handleRegister} width="full">
          Register
        </Button>
      </VStack>
    </Box>
  );
}
