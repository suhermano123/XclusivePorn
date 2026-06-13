import type { IConfig } from 'next-sitemap';

const config: IConfig = {
  siteUrl: "https://novapornx.com",
  generateRobotsTxt: false,
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    "/api/*",
    "/AdminDelete",
    "/AdminDelete/*",
    "/VideoDownloader",
    "/VideoDownloader/*",
    "/search",
    "/search/*",
    "/moviesDownload",
    "/moviesDownload/*",
    "/images",
    "/images/*",
  ],

  transform: async (config: IConfig, path: string) => {
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === "/") {
      priority = 1.0;
      changefreq = "daily";
    } else if (path === "/categories") {
      priority = 0.9;
      changefreq = "daily";
    } else if (
      path === "/free-hd-porn-videos" ||
      path === "/4k-porn-videos" ||
      path === "/latina-hd-porn" ||
      path === "/premium-hd-porn"
    ) {
      priority = 0.8;
      changefreq = "daily";
    } else if (path.startsWith("/category/")) {
      priority = 0.7;
      changefreq = "daily";
    } else if (path.startsWith("/video/")) {
      priority = 0.6;
      changefreq = "weekly";
    } else if (
      path === "/faq" ||
      path.startsWith("/DMCA") ||
      path.startsWith("/TERMS") ||
      path.startsWith("/Privacy-policy")
    ) {
      priority = 0.3;
      changefreq = "monthly";
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod
        ? new Date().toISOString()
        : undefined,
    };
  },
};

export default config;