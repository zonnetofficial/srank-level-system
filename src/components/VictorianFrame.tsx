import React from 'react';

interface VictorianFrameProps {
  children: React.ReactNode;
  className?: string;
}

const VictorianFrame: React.FC<VictorianFrameProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative min-h-screen px-4 pt-6 pb-6 max-w-lg mx-auto ${className}`}>
      {/* Victorian border frame */}
      <div className="victorian-frame pointer-events-none" aria-hidden="true">
        {/* Corner ornaments */}
        <div className="victorian-corner victorian-corner-tl" />
        <div className="victorian-corner victorian-corner-tr" />
        <div className="victorian-corner victorian-corner-bl" />
        <div className="victorian-corner victorian-corner-br" />

        {/* Side lines */}
        <div className="victorian-line victorian-line-top" />
        <div className="victorian-line victorian-line-bottom" />
        <div className="victorian-line victorian-line-left" />
        <div className="victorian-line victorian-line-right" />
      </div>

      {children}
    </div>
  );
};

export default VictorianFrame;
