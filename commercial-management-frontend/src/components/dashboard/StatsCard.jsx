import React from "react";
import { Card } from "react-bootstrap";

const StatsCard = ({ title, value }) => {
  return (
    <Card className="shadow-sm text-center p-3">
      <h6 className="text-muted">{title}</h6>
      <h3>{value}</h3>
    </Card>
  );
};

export default StatsCard;
