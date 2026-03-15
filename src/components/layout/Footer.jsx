import { Box, Text } from "@chakra-ui/react";

export default function Footer() {

  return (

    <Box
      bg="gray.100"
      py={4}
      textAlign="center"
      mt={10}
      borderTop="1px solid #e2e8f0"
    >

      <Text fontSize="sm">
        © 2026 Cricket Scheduler • Built for Weekend Cricket 🏏
      </Text>

    </Box>

  );
}