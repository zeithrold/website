"use client";

import type { ReactElement } from "react";
import { ContactSection } from "@/components/home/contact-section";
import { HeroSection } from "@/components/home/hero-section";
import { ProjectsSection } from "@/components/home/projects-section";
import { SpacesSection } from "@/components/home/spaces-section";
import { SiteShell } from "@/components/site-shell";

export function Homepage(): ReactElement {
  return (
    <SiteShell>
      <HeroSection />
      <ProjectsSection />
      <SpacesSection />
      <ContactSection />
    </SiteShell>
  );
}
