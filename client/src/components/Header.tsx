import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
  {/* <div className="max-w-3xl mx-auto flex items-center justify-start"> */}
      <div>
        <div className="flex items-center space-x-3">
          <div>
            {/* Clicking the logo navigates to the root path */}
            <a href="/" aria-label="Go to StratSync home">
              <img
                src="images/header_logo.jpeg"
                alt="Stratsync Logo"
                className="h-10 w-auto mr-2"
              />
            </a>
          </div>
        </div>
      </div>
</header>

  );
};

export default Header;
