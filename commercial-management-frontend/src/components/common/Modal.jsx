import React from 'react';
import { Modal as BModal, Button } from 'react-bootstrap';

const Modal = ({
  show,
  onHide,
  title,
  children,
  size = 'lg',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  showFooter = true,
  confirmVariant = 'primary',
  loading = false,
}) => {
  return (
    <BModal show={show} onHide={onHide} size={size} centered>
      <BModal.Header closeButton>
        <BModal.Title>{title}</BModal.Title>
      </BModal.Header>

      <BModal.Body>{children}</BModal.Body>

      {showFooter && (
        <BModal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button 
              variant={confirmVariant} 
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Chargement...
                </>
              ) : (
                confirmText
              )}
            </Button>
          )}
        </BModal.Footer>
      )}
    </BModal>
  );
};

export default Modal;