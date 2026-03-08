import React from "react";
import { Box, Flex, Text, Spacer, Button, Image } from "@chakra-ui/react";

export default function Header({ user, onLogout }) {
  return (
    <Box bg="blue.600" color="white" p={4}>
      <Flex align="center">
        <Image src="/logo.png" alt="Team Logo" boxSize="50px" mr={3} />
        <Text fontSize="2xl" fontWeight="bold">
          D-Beast Cricket
        </Text>
        <Spacer />
        {user && (
          <Flex align="center" gap={4}>
            <Text>Welcome, {user.name}</Text>
            <Button colorScheme="red" onClick={onLogout}>
              Logout
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}