import type { Metadata } from "next";
import "./globals.css";
import { PreferencesProvider } from "@/components/preferences-provider";
import { en } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Zeithrold — Projects, experiments & notes",
  description: en["meta.description"],
  metadataBase: new URL("https://ztd.me"),
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "Zeithrold", description: en["meta.description"], url: "https://ztd.me", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Zeithrold — Ideas into useful things." }] },
  twitter: { card: "summary_large_image", title: "Zeithrold", description: en["meta.description"], images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><PreferencesProvider>{children}</PreferencesProvider></body></html>;
}
