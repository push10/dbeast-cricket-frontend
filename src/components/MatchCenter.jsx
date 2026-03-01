import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  VStack,
  Button,
} from "@chakra-ui/react";
import axios from "axios";

const API_BASE = "http://localhost:8080/api/matches";

export default function MatchCenter({ onCreateClick }) {
  const [matches, setMatches] = useState([]);

  const fetchMatches = async () => {
    try {
      const res = await axios.get(API_BASE);
      setMatches(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch matches. Make sure backend is running.");
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <VStack spacing={5} align="stretch" p={5}>
      <Box>
        <Button colorScheme="green" mb={5} onClick={onCreateClick}>
          + Create Match
        </Button>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Team A</Th>
              <Th>Team B</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {matches.map((m) => (
              <Tr key={m.id}>
                <Td>{m.id}</Td>
                <Td>{m.teamA}</Td>
                <Td>{m.teamB}</Td>
                <Td>{m.matchDate}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
}