import { FC } from "react";
import { Container, Box } from "@mui/material";
import { Navbar } from "../../components";
import { LayoutRouteProps } from "react-router-dom";


const Layout: FC<LayoutRouteProps> = ({children}) => {
    return(
        <Box>
            <Navbar/>
            <Container>
                {children}
            </Container>
        </Box>
    )
}

export default Layout;