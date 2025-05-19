import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
}

const SectionTitlePink: React.FC<SectionTitleProps> = ({ children }) => {
  return (
    <h3 className="text-lg font-semibold text-white bg-brand-pink p-3 rounded-lg shadow-sm">
      {children}
    </h3>
  );
};

export default SectionTitlePink;