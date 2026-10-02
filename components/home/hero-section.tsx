import type { ReactElement } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Asterisk,
  Braces,
  GitBranch as Github,
  Layers,
  Sparkles,
} from "lucide-react";
import { useCopy } from "@/components/preferences-provider";
import { Button } from "@/components/ui/button";
import { LINKS } from "@/lib/projects";

function IdeaSketch(): ReactElement {
  const t = useCopy();
  return (
    <div className="idea-sketch" aria-hidden="true">
      <p className="eyebrow sketch-label">{t("sketch.label")}</p>
      <div className="sketch-canvas">
        <svg className="sketch-lines" viewBox="0 0 360 210">
          <path d="M84 66 C160 34 236 70 256 135 M84 66 C67 150 134 193 173 156 M173 156 Q244 207 256 135" />
          <circle cx="162" cy="71" r="3" />
          <circle cx="108" cy="147" r="3" />
          <circle cx="226" cy="173" r="3" />
        </svg>
        <div className="idea-node node-memory"><Layers size={25} /><span>{t("sketch.memory")}</span></div>
        <div className="idea-node node-build"><Braces size={30} /><span>{t("sketch.build")}</span></div>
        <div className="idea-node node-explore"><Sparkles size={24} /><span>{t("sketch.explore")}</span></div>
        <span className="sketch-plus plus-one">+</span><span className="sketch-plus plus-two">+</span>
      </div>
      <p className="sketch-caption">{t("sketch.caption")}</p>
    </div>
  );
}

export function HeroSection(): ReactElement {
  const t = useCopy();
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow">
          <Asterisk className="asterisk" size={22} aria-hidden="true" />{t("eyebrow")}
        </p>
        <h1 id="hero-heading">{t("hero.first")}<br /><span>{t("hero.second")}</span></h1>
        <p className="hero-description">{t("hero.description")}</p>
        <div className="hero-actions">
          <Button asChild className="primary-link">
            <a href="#projects">{t("hero.explore")}<ArrowDown size={15} aria-hidden="true" /></a>
          </Button>
          <a href={LINKS.github} className="github-link">
            <Github size={16} aria-hidden="true" />{t("hero.github")}
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
      <IdeaSketch />
    </section>
  );
}
