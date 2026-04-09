import React, { useState, useEffect } from "react";

const images = [
  "/images/carousel/1.jpg",
  "/images/carousel/2.jpg",
  "/images/carousel/3.jpg",
  "/images/carousel/4.jpg",
  "/images/carousel/5.jpg",
];

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((img, index) => (
        <div
          key={img}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            index === currentIndex
              ? "opacity-100 translate-x-0 scale-100"
              : index < currentIndex
              ? "opacity-0 -translate-x-full scale-110"
              : "opacity-0 translate-x-full scale-110"
          }`}
        >
          <img
            src={img}
            alt={`Carousel ${index + 1}`}
            className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${
              index === currentIndex ? "scale-110" : "scale-100"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-white w-4" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
