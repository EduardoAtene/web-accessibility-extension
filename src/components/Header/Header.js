import React from 'react';
import './Header.css';

const Header = ({ children, size }) => {
  return <h1 className={`custom-header ${size}`}>{children}</h1>;
};

export default Header;