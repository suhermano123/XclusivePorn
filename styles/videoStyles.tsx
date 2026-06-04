// Styles adapted from ListVideos
export const styles: { [key: string]: any } = {
    gridContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "15px",
        padding: "0",
    },
    videoCardSx: {
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "12px",
        transition: "all 0.25s ease-in-out",
        cursor: "pointer",
        backgroundColor: "#111",
        border: "1px solid rgba(255,255,255,0.05)",
        "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.5)",
            borderColor: "#f013e5",
            zIndex: 10,
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
        borderRadius: "8px",
    },
    metadataArea: {
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    videoTitle: {
        color: "#fff",
        fontSize: "13px",
        fontWeight: "bold",
        margin: 0,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        lineHeight: "1.2"
    },
    durationLabel: {
        color: "rgba(255,255,255,0.5)",
        fontSize: "11px",
    }
};