import {
  Card,
  Table,
  Grid,
  Image,
  Text,
  Spacer,
  Badge,
} from "@nextui-org/react";
import Skeleton from "react-loading-skeleton";

import { FJetton } from "../Jetton";
import { Link } from "react-router-dom";

type Item = {
  name: string;
  image: string;
  price: number;
  volume: number;
  color: string;
  percent: number;
  chart: { value: number }[];
};

interface Props {
  title: React.ReactNode;
  list: Item[];
  isLoading: boolean;
}

export const FCard: React.FC<React.PropsWithChildren<Props>> = ({
  title,
  list,
  isLoading,
}) => {
  return (
    <Card css={{ p: "$6" }}>
      <Card.Header>{title}</Card.Header>
      <Card.Body css={{ p: 0, overflow: "hidden" }}>
        <Grid.Container gap={0.8}>
          {isLoading ? (
            <Grid.Container gap={0.8}>
              {new Array(9).fill(null).map((_, i) => (
                <Grid key={i} xs={4}>
                  <Skeleton
                    count={1}
                    borderRadius={20}
                    height={75}
                    width={75}
                  />
                </Grid>
              ))}
            </Grid.Container>
          ) : (
            list?.map(
              ({ name, image, price, volume, percent, color, chart }, i) => (
                <Grid key={i} xs={4}>
                  <Link
                    to={`/analytics/price/${name}`}
                    style={{ width: "100%" }}
                  >
                    <Card
                      isHoverable
                      isPressable
                      variant="flat"
                      className="card"
                    >
                      <Card.Header>
                        <Grid.Container wrap="nowrap" justify="space-between">
                          <Grid>
                            <Image
                              src={image}
                              width={24}
                              style={{ borderRadius: 100 }}
                            />
                          </Grid>
                          <Spacer x={0.4} />
                          <Grid>
                            <Badge size="xs" css={{ background: color }}>
                              {(percent || 0)?.toFixed(2)}%
                            </Badge>
                          </Grid>
                        </Grid.Container>
                      </Card.Header>
                      <Card.Body className="card-body">
                        <FJetton
                          index={i}
                          data={
                            chart.length > 1
                              ? chart.map((v) => ({ pv: v.value }))
                              : [{ pv: 0 }, { pv: 0 }]
                          }
                          height={32}
                          color={color}
                        />
                        <Text
                          css={{
                            overflow: "hidden",
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          {name}
                        </Text>
                        <Text
                          color="primary"
                          css={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            textAlign: "center",
                            overflow: "hidden",
                            lineHeight: "var(--nextui-lineHeights-md)",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            position: "absolute",
                            left: "50%",
                            transform: "translate3d(-50%, 0, 0)",
                          }}
                        >
                          <div>{price}</div> TON
                        </Text>
                      </Card.Body>
                    </Card>
                  </Link>
                </Grid>
              )
            )
          )}
        </Grid.Container>
      </Card.Body>
    </Card>
  );
};
