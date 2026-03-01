import React, { useState } from "react";
import { ChakraProvider, Tabs, TabList, TabPanels, Tab, TabPanel, Box, Button } from "@chakra-ui/react";
import MatchCenter from "./components/MatchCenter";
import CreateMatch from "./components/CreateMatch";
import Players from "./components/Players";

export default function App() {
  const [showCreateMatch, setShowCreateMatch] = useState(false);

  const handleNavigateToCreate = () => {
    setShowCreateMatch(true);
  };

  const handleBackToMatches = () => {
    setShowCreateMatch(false);
  };

  return (
    <ChakraProvider>
      <Box p={5}>
        {showCreateMatch ? (
          <Box>
            <Button mb={5} onClick={handleBackToMatches}>
              ← Back to Match Center
            </Button>
            <CreateMatch />
          </Box>
        ) : (
          <Tabs variant="enclosed" isFitted>
            <TabList>
              <Tab>Match Center</Tab>
              <Tab>Players</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <MatchCenter onCreateClick={handleNavigateToCreate} />
              </TabPanel>
              <TabPanel>
                <Players />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </Box>
    </ChakraProvider>
  );
}