import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alhana Logistique",
    short_name: "Alhana",
    description: "Alhana Logistique — نظام لوجستيك وCRM لمجموعة الهناء التجارية",
    start_url: "/login",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#0a8e42",
    lang: "ar",
    dir: "rtl",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}

