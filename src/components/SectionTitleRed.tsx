import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
}

const SectionTitleRed: React.FC<SectionTitleProps> = ({ children }) => {
  return (
    <h3 className="text-lg font-semibold text-white bg-red-500 p-3 rounded-lg shadow-sm">
      {children}
    </h3>
  );
};

export default SectionTitleRed;