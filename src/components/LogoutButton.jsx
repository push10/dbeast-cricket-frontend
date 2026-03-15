import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../api/auth";

export default function LogoutButton({ setCurrentUser }) {

  const navigate = useNavigate();

  const handleLogout = () => {

    clearAuth();

    if (setCurrentUser) {
      setCurrentUser(null);
    }

    navigate("/login");
  };

  return (
    <Button colorScheme="red" onClick={handleLogout}>
      Logout
    </Button>
  );
}