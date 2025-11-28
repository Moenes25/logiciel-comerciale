import React from "react";
import Card from "../common/Card";

const DossierDetails = ({ dossier }) => {
  if (!dossier) return <p>Sélectionnez un dossier pour voir les détails.</p>;

  return (
    <Card title={`Dossier: ${dossier.titre}`}>
      <p><strong>ID:</strong> {dossier._id}</p>
      <p><strong>Description:</strong> {dossier.description}</p>
      <p><strong>Créé le:</strong> {new Date(dossier.createdAt).toLocaleDateString()}</p>
      <p><strong>Mis à jour le:</strong> {new Date(dossier.updatedAt).toLocaleDateString()}</p>
    </Card>
  );
};

export default DossierDetails;
