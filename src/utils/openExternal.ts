export const openExternal = (url: string) => {
  const win = window.open("about:blank", "_blank", "noopener,noreferrer");

  if (win) {
    win.opener = null;
    win.location.href = url;
  }
};