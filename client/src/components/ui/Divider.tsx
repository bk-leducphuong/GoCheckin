import React, { ReactNode } from "react";

interface DividerProps {
  children?: ReactNode;
  className?: string;
}

export function Divider({ children, className = "" }: DividerProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="flex-grow border-t border-gray-300"></div>
      {children && (
        <span className="flex-shrink mx-4 text-gray-500 text-sm">
          {children}
        </span>
      )}
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
  );
}
