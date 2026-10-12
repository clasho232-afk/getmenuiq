import React from 'react';

const MenuDescriptionWidget = ({ onClick }) => {
  return (
    <div
      className="pricing-gauge-card transition-transform duration-300 hover:-translate-y-1 cursor-pointer flex items-center justify-center"
      style={{
        minHeight: '280px',
        height: '100%',
        padding: 0
      }}
      onClick={onClick}
    >
      <span className="text-gray-400 text-sm font-medium">Menu Description Widget</span>
    </div>
  );
};

export default MenuDescriptionWidget;
