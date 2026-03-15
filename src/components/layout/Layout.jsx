import Header from "./Header";
import Footer from "./Footer";
import { Box } from "@chakra-ui/react";

export default function Layout({ user, setUser, children }) {

  return (

    <Box minHeight="100vh">

      <Header user={user} setUser={setUser} />

      <Box px={6} py={6}>

        {children}

      </Box>

      <Footer />

    </Box>

  );
}