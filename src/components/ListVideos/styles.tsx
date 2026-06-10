export const styles: { [key: string]: any } = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#000",
    overflowX: "hidden"
  },
  gridContainer: {
    // This style object is partially superseded by the sx prop in the component render,
    // but kept here for reference or fallback.
    display: "grid",
    gap: "15px",
    padding: "9px",
  },
  videoCardSx: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: "1px",
    transition: "all 0.25s ease-in-out",
    cursor: "pointer",
    backgroundColor: "#111",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.5)",
      zIndex: 10,
      "& img, & video": {
        opacity: 0.9
      }
    }
  },
  thumbnailContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    backgroundColor: "#000",
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "8px 8px 0 0",
    display: "block",
    transition: "transform 0.3s ease",
  },
  metadataArea: {
    padding: "3px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#111",
  },
  videoTitle: {
    color: "#fff",
    fontSize: "12px",
    fontWeight: "700",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.4",
  },
  statsText: {
    fontSize: "11px",
    color: "#ccc",
    fontWeight: "600",
  },
  durationLabel: {
    fontSize: "10px",
    color: "#aaa",
    fontWeight: "bold",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  sourceChip: {
    backgroundColor: "rgba(240, 19, 229, 0.15)",
    color: "#f013e5",
    fontSize: "0.65rem",
    height: "18px",
    fontWeight: "bold",
    border: "1px solid rgba(240, 19, 229, 0.3)",
    '& .MuiChip-label': { padding: '0 6px' }
  },
  paginationBtnSx: {
    backgroundColor: "#f013e5",
    color: "#fff",
    borderRadius: "20px",
    padding: "8px 25px",
    fontWeight: "bold",
    boxShadow: "0 4px 10px rgba(240, 19, 229, 0.3)",
    "&:hover": {
      backgroundColor: "#e91ec4",
      transform: "scale(1.05)",
    },
    "&:disabled": {
      backgroundColor: "rgba(255,255,255,0.05)",
      color: "rgba(255,255,255,0.2)",
    },
  },
  pageNumberBtnSx: {
    minWidth: "36px",
    height: "36px",
    borderRadius: "10%",
    fontWeight: "bold",
    transition: "all 0.2s",
    "&:hover": {
      transform: "scale(1.1)",
    }
  }
};