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

import { FJetton } from "./FJetton";

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
      <Card.Body css={{ p: 0 }}>
        <Table
          aria-label="Example table with static content"
          css={{
            p: 0,
          }}
          compact
          align="left"
        >
          <Table.Header>
            <Table.Column>Name</Table.Column>
            <Table.Column>Price</Table.Column>
            <Table.Column>Chart</Table.Column>
            <Table.Column>Change</Table.Column>
          </Table.Header>
          <Table.Body>
            {isLoading
              ? new Array(5).fill(null).map((_, i) => (
                  <Table.Row key={i.toString()}>
                    <Table.Cell>
                      <Grid.Container wrap="nowrap">
                        <Grid>
                          <Skeleton
                            count={1}
                            borderRadius={100}
                            height={18}
                            width={18}
                          />
                        </Grid>
                        <Spacer x={0.4} />
                        <Grid>
                          <Skeleton
                            count={1}
                            height={18}
                            width={50}
                            borderRadius={100}
                          />
                        </Grid>
                      </Grid.Container>
                    </Table.Cell>
                    <Table.Cell>
                      <Skeleton
                        count={1}
                        height={18}
                        width={150}
                        borderRadius={100}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Skeleton
                        count={1}
                        height={18}
                        width={75}
                        borderRadius={100}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Skeleton
                        count={1}
                        height={18}
                        width={40}
                        borderRadius={100}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))
              : list?.map(
                  (
                    { name, image, price, volume, percent, color, chart },
                    i
                  ) => (
                    <Table.Row key={i.toString()}>
                      <Table.Cell>
                        <Grid.Container wrap="nowrap">
                          <Grid>
                            <Image
                              src={image}
                              width={24}
                              style={{ borderRadius: 100 }}
                            />
                          </Grid>
                          <Spacer x={0.4} />
                          <Grid>
                            <Text>{name}</Text>
                          </Grid>
                        </Grid.Container>
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="primary">{price} TON</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <FJetton
                          data={
                            chart.length > 1
                              ? chart.map((v) => ({ pv: v.value }))
                              : [{ pv: 0 }, { pv: 0 }]
                          }
                          height={32}
                          color={color}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Badge size="xs" css={{ mt: "$3", background: color }}>
                          {(percent || 0)?.toFixed(2)}%
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  )
                )}
          </Table.Body>
        </Table>
      </Card.Body>
    </Card>
  );
};
