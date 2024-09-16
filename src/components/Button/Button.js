import React from 'react';
import './Button.css';

const Button = ({ onClick, children }) => {
  return (
    <button className="btn btn-primary mt-4 mb-4" onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;