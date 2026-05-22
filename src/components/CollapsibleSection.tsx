import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  headerClassName?: string;
  headerStyle?: React.CSSProperties;
  defaultOpen?: boolean;
  className?: string;
  headerExtra?: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  headerClassName = '',
  headerStyle,
  defaultOpen = false,
  className = '',
  headerExtra,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-lg overflow-hidden shadow-sm ${className}`}>
      <div
        className={`w-full flex items-center justify-between p-3 text-white font-semibold text-lg ${headerClassName}`}
        style={headerStyle}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center justify-between text-left transition-all duration-200 hover:brightness-95"
        >
          <span>{title}</span>
          <ChevronDown
            className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} ${headerExtra ? 'mr-3' : ''}`}
          />
        </button>
        {headerExtra && <div onClick={(e) => e.stopPropagation()}>{headerExtra}</div>}
      </div>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
