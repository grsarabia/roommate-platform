"use client";

import { useState } from "react";

interface ListingCarouselProps {
  photos: string[];
}

export default function ListingCarousel({ photos }: ListingCarouselProps) {
  const [current, setCurrent] = useState(0);

  if (!photos || photos.length === 0) {
    return <p>📷 Sin fotos disponibles</p>;
  }

  function prevSlide() {
    setCurrent((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }

  function nextSlide() {
    setCurrent((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "600px", margin: "auto" }}>
      <img
        src={photos[current]}
        alt={`Foto ${current + 1}`}
        style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "8px" }}
      />

      {/* Botones de navegación */}
      <button
        onClick={prevSlide}
        style={{
          position: "absolute",
          top: "50%",
          left: "10px",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          cursor: "pointer",
        }}
      >
        ‹
      </button>

      <button
        onClick={nextSlide}
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          cursor: "pointer",
        }}
      >
        ›
      </button>

      {/* Indicadores */}
      <div style={{ textAlign: "center", marginTop: "8px" }}>
        {photos.map((_, index) => (
          <span
            key={index}
            onClick={() => setCurrent(index)}
            style={{
              cursor: "pointer",
              fontSize: "1.5rem",
              margin: "0 4px",
              color: index === current ? "#333" : "#ccc",
            }}
          >
            •
          </span>
        ))}
      </div>
    </div>
  );
}
