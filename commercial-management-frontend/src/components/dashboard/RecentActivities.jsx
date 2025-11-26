import React from "react";
import { ListGroup, Card } from "react-bootstrap";

const activities = [
  "Commande #1023 créée",
  "Client John Doe ajouté",
  "Facture #1102 payée",
  "Produit 'Chaise' mis à jour",
];

const RecentActivities = () => {
  return (
    <Card className="shadow-sm p-3">
      <h5>Activités récentes</h5>
      <ListGroup variant="flush">
        {activities.map((act, index) => (
          <ListGroup.Item key={index}>{act}</ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default RecentActivities;
