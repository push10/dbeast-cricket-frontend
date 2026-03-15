import {
  Box,
  Flex,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text
} from "@chakra-ui/react";

import { Link, useNavigate } from "react-router-dom";

export default function Header({ user, setUser }) {

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");

    setUser(null);

    navigate("/login");

  };

  return (

    <Box bg="blue.600" px={6} py={3} color="white">

      <Flex align="center" justify="space-between">

        {/* Logo */}
        <Text fontSize="xl" fontWeight="bold">
          🏏 Cricket Scheduler
        </Text>

        {/* Navigation */}
        <Flex gap={4}>

          <Link to="/matches">
            <Button variant="ghost" color="white">
              Matches
            </Button>
          </Link>

          <Link to="/create-match">
            <Button variant="ghost" color="white">
              Create Match
            </Button>
          </Link>

        </Flex>

        {/* User Dropdown */}
        <Menu>

          <MenuButton
            as={Button}
            variant="ghost"
            color="white"
          >
            <Flex align="center" gap={2}>

              <Avatar size="sm" name="User" />

              <Text>{user.name}</Text>

            </Flex>

          </MenuButton>

          <MenuList color="black">

            <MenuItem>
              Profile
            </MenuItem>

            <MenuItem>
              Settings
            </MenuItem>

            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>

          </MenuList>

        </Menu>

      </Flex>

    </Box>

  );

}