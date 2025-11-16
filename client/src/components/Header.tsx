import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
      <div className="w-full flex items-center justify-start">
        {/* logo */}
        <a href="/" aria-label="Go to tionale home" className="flex items-center">
          <img
            src="images/tionale_logo.png"
            alt="tionale Logo"
            className="h-10 w-auto mr-2"
          />
        </a>

        {/* label next to logo, same line */}
        <span className="text-sm font-medium text-gray-700 mt-6">Proof of Concept</span>
      </div>
    </header>
  );
};

export default Header;
