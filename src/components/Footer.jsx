import React from "react";
import { Box, Text } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box bg="gray.100" py={4} textAlign="center" mt={10}>
      <Text fontSize="sm" color="gray.600">
        © 2026 D-Beast Cricket. All rights reserved.
      </Text>
    </Box>
  );
}