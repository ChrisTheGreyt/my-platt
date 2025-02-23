import React, { useState } from 'react';

const DropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown">
      <button onClick={toggleMenu} className="dropdown-toggle">
        Menu
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          <li className="dropdown-item">Item 1</li>
          <li className="dropdown-item">Item 2</li>
          <li className="dropdown-item">Item 3</li>
        </ul>
      )}
    </div>
  );
};

export default DropdownMenu;
