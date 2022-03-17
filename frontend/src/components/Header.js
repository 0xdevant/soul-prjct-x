import React from "react";

function Header() {
  return (
    <div className="header py-4 sm:w-11/12 mx-auto flex justify-center items-center">
      <picture>
        <source
          media="(min-width: 641px)"
          srcSet="/assets/PRJCT_X_logo_desktop.png"
        />
        <source
          media="(max-width: 640px)"
          srcSet="/assets/PRJCT_X_logo_mobile.png"
        />
        <img
          src="/assets/PRJCT_X_logo_desktop.png"
          alt="PRJCT Logo"
          className="p-2"
        />
      </picture>
    </div>
  );
}

export default Header;
