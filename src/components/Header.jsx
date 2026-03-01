import React from "react";
import { Flex, Box, Image, Text, Spacer, Button } from "@chakra-ui/react";

export default function Header({ onLogout }) {
  return (
    <Flex
      bg="blue.600"
      color="white"
      px={5}
      py={3}
      align="center"
      shadow="md"
    >
      <Flex align="center">
        <Image
          src="/team-logo.png"
          alt="D-Beast Logo"
          boxSize="50px"
          objectFit="cover"
          mr={3}
        />
        <Text fontSize="2xl" fontWeight="bold">
          D-Beast
        </Text>
      </Flex>
      <Spacer />
      <Button colorScheme="red" variant="solid" onClick={onLogout}>
        Logout
      </Button>
    </Flex>
  );
}