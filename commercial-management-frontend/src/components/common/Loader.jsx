import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ fullScreen = true, size = 'lg', text = 'Chargement...' }) => {
  if (fullScreen) {
    return (
      <div 
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        {text && <p className="mt-3 text-muted">{text}</p>}
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <Spinner animation="border" variant="primary" size={size} />
      {text && <span className="ms-2">{text}</span>}
    </div>
  );
};

export default Loader;