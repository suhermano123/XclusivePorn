import React, { useEffect, useRef } from "react";
import { CSSProperties } from "react";

const ThumbnailSlider = ({ thumbnails }: { thumbnails: string }) => {
  const images = thumbnails.split(",").map((url) => url.trim());
  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let scrollAmount = 0;
    let isPaused = false;

    const scrollThumbnails = () => {
      if (isPaused) return;

      scrollAmount += 1; // Velocidad del scroll
      if (scrollAmount >= slider.scrollWidth / 2) {
        scrollAmount = 0;
        slider.scrollLeft = 0;
      } else {
        slider.scrollLeft += 1;
      }
      requestAnimationFrame(scrollThumbnails);
    };

    const startScrolling = () => {
      isPaused = false;
      scrollThumbnails();
    };

    const stopScrolling = () => {
      isPaused = true;
    };

    slider.addEventListener("mouseenter", stopScrolling);
    slider.addEventListener("mouseleave", startScrolling);

    startScrolling();

    return () => {
      slider.removeEventListener("mouseenter", stopScrolling);
      slider.removeEventListener("mouseleave", startScrolling);
    };
  }, []);

  const styles: { [key: string]: CSSProperties } = {
    container: {
      display: "flex",
      overflow: "hidden",
      width: "100%",
      padding: "10px 0",
      position: "relative",
      whiteSpace: "nowrap" as const,
    },
    slider: {
      display: "flex",
      gap: "10px",
      animation: "scroll 02s linear infinite",
      flexWrap: "nowrap" as const,
    },
    image: {
      width: "250px",
      height: "195px",
      objectFit: "cover" as const,
      borderRadius: "5px",
      cursor: "pointer",
      flexShrink: 0,
      transition: "transform 0.2s ease-in-out",
    },
  };

  return (
    <div style={styles.container} ref={sliderRef}>
      <div style={styles.slider}>
        {images.concat(images).map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index}`}
            style={styles.image}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        ))}
      </div>
    </div>
  );
};

export default ThumbnailSlider;
