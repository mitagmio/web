import { Container, Grid, Image, Text } from "@nextui-org/react";
import { useLocation } from "react-router-dom";
import { ReactComponent as Error } from "../public/img/404.svg";

const NotFound = () => {
  const location = useLocation();

  console.log(location.pathname);

  return (
    <Container>
      <Grid.Container justify="center" alignItems="center">
        <Grid>
          <Error
            style={{ height: "100vh", color: "var(--nextui-colors-primary)" }}
          />
        </Grid>
      </Grid.Container>
    </Container>
  );
};

export default NotFound;
