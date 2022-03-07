import React from "react";

function HeroImage() {
  return (
    <div className="flex-1">
      <picture>
        <source
          media="(min-width: 641px)"
          srcset="/assets/HeroImageDesktop.png"
        />
        <source media="(max-width: 640px)" srcset="/assets/HeroImageiOS.png" />
        <img
          src="/assets/HeroImageDesktop.png"
          alt="PRJCT-X Headphone"
          className="mx-auto"
        />
      </picture>
    </div>
  );
}

export default HeroImage;
