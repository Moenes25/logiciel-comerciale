import React, { useState } from "react";
import dossierService from "../../services/dossierService";
import { Form, Button } from "react-bootstrap";
import Alert from "../common/Alert";

const DossierForm = ({ dossier, onSuccess }) => {
  const [formData, setFormData] = useState(dossier || { titre: "", description: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = dossier ? await dossierService.update(dossier._id, formData)
                        : await dossierService.create(formData);
    if (res.success) onSuccess(res.data);
    else setError(res.message);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert message={error} type="danger" />}
      <Form.Group className="mb-3">
        <Form.Label>Titre</Form.Label>
        <Form.Control
          type="text"
          name="titre"
          value={formData.titre}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          required
        />
      </Form.Group>
      <Button type="submit" variant="primary">
        {dossier ? "Modifier Dossier" : "Créer Dossier"}
      </Button>
    </Form>
  );
};

export default DossierForm;
