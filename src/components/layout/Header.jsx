import {
  Box,
  Flex,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Badge,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { logoutPlayer } from "../../api/authApi";

export default function Header({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutPlayer();
    setUser(null);
    navigate("/login");
  };

  return (
    <Box bg="blue.600" px={6} py={3} color="white">
      <Flex align="center" justify="space-between" gap={4} wrap="wrap">
        <Text fontSize="xl" fontWeight="bold">
          Cricket Scheduler
        </Text>

        <Flex gap={3} wrap="wrap">
          <Button as={RouterLink} to="/matches" variant="ghost" color="white">
            Matches
          </Button>
          <Button as={RouterLink} to="/ledger" variant="ghost" color="white">
            Ledger
          </Button>
          <Button as={RouterLink} to="/create-match" variant="ghost" color="white">
            Create Match
          </Button>
          <Button as={RouterLink} to="/teams" variant="ghost" color="white">
            Teams
          </Button>
          <Button as={RouterLink} to="/profile" variant="ghost" color="white">
            Profile
          </Button>
        </Flex>

        <Menu>
          <MenuButton as={Button} variant="ghost" color="white">
            <Flex align="center" gap={2}>
              <Avatar size="sm" name={user?.name || "User"} src={user?.profileImageUrl} />
              <Text>{user?.name || "Player"}</Text>
              <Badge colorScheme={user?.userRole === "CAPTAIN" ? "orange" : "green"}>
                {user?.userRole || "PLAYER"}
              </Badge>
            </Flex>
          </MenuButton>

          <MenuList color="black">
            <MenuItem as={RouterLink} to="/profile">
              Profile
            </MenuItem>
            <MenuItem as={RouterLink} to="/teams">
              Teams
            </MenuItem>
            <MenuItem as={RouterLink} to="/ledger">
              Ledger
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
