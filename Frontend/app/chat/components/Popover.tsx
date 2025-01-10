import React, { ReactNode, useState } from "react";

interface PopoverProps {
  children: ReactNode;
}

const Popover: React.FC<PopoverProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopover = () => setIsOpen((prev) => !prev);

  const handleClose = () => setIsOpen(false);

  return (
    <div className="relative inline-block text-left">
      {/* Vertical Ellipsis Button */}
      <button
        onClick={togglePopover}
        className="p-2 rounded-full bg-gray-50 hover:bg-gray-200 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute -top-12 right-0 mt-2 w-60 py-2 px-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 cursor-pointer hover:bg-gray-100 duration-300">
          {children}
        </div>
      )}

      {/* Click outside handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={handleClose}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default Popover;
