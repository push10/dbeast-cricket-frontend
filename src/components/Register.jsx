import React, { useState } from "react";
import { Box, Input, Button, VStack, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { registerPlayer } from "../api/playerApi";

export default function Register() {

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {

    try {

      await registerPlayer({
        name,
        mobile,
        password,
      });

      alert("Registration successful");

      navigate("/login");

    } catch (err) {

      console.error(err);
      alert("Registration failed");

    }
  };

  return (
    <Box maxW="sm" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="md">
      <VStack spacing={4}>

        <Heading size="md">Register</Heading>

        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button colorScheme="green" onClick={handleRegister} width="full">
          Register
        </Button>

      </VStack>
    </Box>
  );
}