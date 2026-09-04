import * as React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { NAV_LINKS } from "../NavMenu/NavMenu";

const PINK = "#f013e5";
const BAR_BG = "#0d0d0d";

const TOP_BUTTONS = [
  { href: "/categories", label: "Categories" },
  { href: "/moviesDownload", label: "Movies" },
];

/**
 * Primary app bar — same dark look on every page (no style override prop).
 * Desktop: one row. Mobile: hamburger + logo + auth on row 1, search on row 2,
 * the section links live in a drawer.
 */
export default function NavBar() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [drawer, setDrawer] = React.useState(false);

  const submitSearch = () => {
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    setDrawer(false);
  };

  const outlineBtn = {
    color: "#fff",
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: "20px",
    textTransform: "none",
    fontWeight: 700,
    px: 2.5,
    whiteSpace: "nowrap",
    "&:hover": { borderColor: "#fff", backgroundColor: "rgba(255,255,255,0.08)" },
  } as const;

  const pinkBtn = {
    backgroundColor: PINK,
    color: "#fff",
    borderRadius: "20px",
    textTransform: "none",
    fontWeight: 700,
    px: 2.5,
    whiteSpace: "nowrap",
    boxShadow: "0 0 12px rgba(240,19,229,0.35)",
    "&:hover": { backgroundColor: "#e91ec4" },
  } as const;

  const searchBox = (compact = false) => (
    <Box
      component="form"
      onSubmit={(e: React.FormEvent) => { e.preventDefault(); submitSearch(); }}
      sx={{
        display: "flex",
        alignItems: "stretch",
        width: "100%",
        maxWidth: compact ? "none" : { lg: 620 },
        minWidth: 0,
        backgroundColor: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <SearchIcon sx={{ alignSelf: "center", ml: 1.25, color: "rgba(255,255,255,0.55)", fontSize: 20 }} />
      <InputBase
        placeholder="Search…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        inputProps={{ "aria-label": "Search videos", size: 1 }}
        sx={{
          flex: 1,
          minWidth: 0,
          color: "#fff",
          fontSize: "0.9rem",
          py: 0.75,
          pl: 1,
          "& .MuiInputBase-input": { minWidth: 0, p: 0 },
        }}
      />
      {compact ? (
        <IconButton type="submit" aria-label="Search" sx={{ flexShrink: 0, borderRadius: 0, color: "#fff", backgroundColor: PINK, px: 1.5, "&:hover": { backgroundColor: "#e91ec4" } }}>
          <SearchIcon sx={{ fontSize: 20 }} />
        </IconButton>
      ) : (
        <Button
          type="submit"
          sx={{
            flexShrink: 0,
            backgroundColor: PINK,
            color: "#fff",
            borderRadius: 0,
            px: 3,
            fontWeight: 700,
            textTransform: "none",
            whiteSpace: "nowrap",
            "&:hover": { backgroundColor: "#e91ec4" },
          }}
        >
          Search
        </Button>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: `linear-gradient(180deg, #161616 0%, ${BAR_BG} 100%)`,
          borderBottom: "1px solid rgba(240,19,229,0.25)",
          color: "#fff",
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            px: { xs: 1.5, md: 3 },
            minHeight: { xs: 56, md: 64 },
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, md: 1.5 },
          }}
        >
          <IconButton
            aria-label="Open menu"
            onClick={() => setDrawer(true)}
            sx={{ color: "#fff", display: { lg: "none" }, ml: -0.5 }}
          >
            <MenuIcon />
          </IconButton>

          <Box component={Link} href="/" sx={{ display: "flex", flexShrink: 0, alignItems: "center" }}>
            <Box
              component="img"
              src="/assets/oficial_logo.webp"
              alt="NovaPornX – Free HD Porn Videos"
              sx={{ height: { xs: 24, md: 32 }, width: "auto", display: "block" }}
            />
          </Box>

          {/* Inline search — lg and up */}
          <Box sx={{ flexGrow: 1, mx: 2, display: { xs: "none", lg: "flex" }, justifyContent: "center" }}>
            {searchBox(false)}
          </Box>

          {TOP_BUTTONS.map((b) => (
            <Button
              key={b.href}
              component={Link}
              href={b.href}
              variant="outlined"
              sx={{ ...outlineBtn, display: { xs: "none", lg: "inline-flex" } }}
            >
              {b.label}
            </Button>
          ))}

          <Box sx={{ flexGrow: 1, display: { xs: "block", lg: "none" } }} />

          <Button variant="outlined" sx={{ ...outlineBtn, display: { xs: "none", md: "inline-flex" } }}>
            Log In
          </Button>
          <Button
            variant="contained"
            sx={{ ...pinkBtn, px: { xs: 1.75, md: 2.5 }, fontSize: { xs: "0.8rem", md: "0.875rem" } }}
          >
            Sign Up
          </Button>
        </Toolbar>

        {/* Search row — below lg */}
        <Box sx={{ display: { xs: "block", lg: "none" }, px: 1.5, pb: 1 }}>{searchBox(true)}</Box>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawer}
        onClose={() => setDrawer(false)}
        PaperProps={{ sx: { width: 280, backgroundColor: BAR_BG, color: "#fff" } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Box component="img" src="/assets/oficial_logo.webp" alt="NovaPornX" sx={{ height: 26 }} />
          <IconButton onClick={() => setDrawer(false)} sx={{ color: "#fff" }} aria-label="Close menu">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box component="nav" sx={{ display: "flex", flexDirection: "column", py: 1 }}>
          {[...NAV_LINKS, ...TOP_BUTTONS.map((b) => ({ ...b, Icon: undefined }))].map((l: any) => (
            <Box
              key={l.href}
              component={Link}
              href={l.href}
              onClick={() => setDrawer(false)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                px: 2.5,
                py: 1.5,
                color: "rgba(255,255,255,0.9)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
                "&:hover": { backgroundColor: "rgba(240,19,229,0.12)", color: "#fff" },
              }}
            >
              {l.Icon ? <l.Icon sx={{ fontSize: 20, color: PINK }} /> : <Box sx={{ width: 20 }} />}
              {l.label}
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: "auto", p: 2, display: "flex", gap: 1.5, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Button fullWidth variant="outlined" sx={outlineBtn}>Log In</Button>
          <Button fullWidth variant="contained" sx={pinkBtn}>Sign Up</Button>
        </Box>
      </Drawer>
    </>
  );
}
