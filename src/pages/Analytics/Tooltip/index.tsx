import { Badge, Button } from "@nextui-org/react";

export const CustomTooltip = ({
  active,
  payload,
  label,
  color,
  symbol,
  decimals = 2,
}: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <Badge
          size="xs"
          content={`${payload[0].value.toFixed(decimals)} ${
            symbol ? symbol : ""
          }`}
          color={
            color
              ? color
              : payload[0].value > 0
              ? "success"
              : payload[0].value === 0
              ? "default"
              : "error"
          }
          css={{ mr: -20 }}
        >
          <Button size="xs" css={{ minWidth: "auto" }}>
            {payload[0]?.payload?.name || label}
          </Button>
        </Badge>
      </div>
    );
  }

  return null;
};
