import React, { useState } from "react";
import { ChakraProvider, Box, Button, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MatchCenter from "./components/MatchCenter";
import CreateMatch from "./components/CreateMatch";
import Players from "./components/Players";

export default function App() {
  const [showCreateMatch, setShowCreateMatch] = useState(false);

  const handleNavigateToCreate = () => setShowCreateMatch(true);
  const handleBackToMatches = () => setShowCreateMatch(false);

  const handleLogout = () => {
    alert("Logout clicked! Implement your auth logic here.");
  };

  return (
    <ChakraProvider>
      <Header onLogout={handleLogout} />
      <Box p={5} minH="70vh">
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
      <Footer />
    </ChakraProvider>
  );
}