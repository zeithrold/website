"use client";

import { ArrowDown, ArrowRight, ArrowUpRight, Asterisk, BookOpen, Braces, Check, GitBranch as Github, Layers, Mail, Sparkles, Terminal } from "lucide-react";
import { useCopy } from "@/components/preferences-provider";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { LINKS, PROJECTS } from "@/lib/projects";

function IdeaSketch() {
  const t = useCopy();
  return <div className="idea-sketch" aria-hidden="true">
    <p className="eyebrow sketch-label">{t("sketch.label")}</p>
    <div className="sketch-canvas">
      <svg className="sketch-lines" viewBox="0 0 360 210"><path d="M84 66 C160 34 236 70 256 135 M84 66 C67 150 134 193 173 156 M173 156 Q244 207 256 135" /><circle cx="162" cy="71" r="3" /><circle cx="108" cy="147" r="3" /><circle cx="226" cy="173" r="3" /></svg>
      <div className="idea-node node-memory"><Layers size={25} /><span>{t("sketch.memory")}</span></div>
      <div className="idea-node node-build"><Braces size={30} /><span>{t("sketch.build")}</span></div>
      <div className="idea-node node-explore"><Sparkles size={24} /><span>{t("sketch.explore")}</span></div>
      <span className="sketch-plus plus-one">+</span><span className="sketch-plus plus-two">+</span>
    </div>
    <p className="sketch-caption">{t("sketch.caption")}</p>
  </div>;
}

function ProjectVisual({ id }: { id: "memory" | "ledger" }) {
  const t = useCopy();
  if (id === "memory") return <div className="project-visual memory-visual" role="img" aria-label={t("memory.visual")}>
    <div className="visual-topline"><span className="visual-dot" />{t("memory.context")}<ArrowUpRight className="visual-glyph" size={13} aria-hidden="true" /></div>
    <div className="memory-diagram" aria-hidden="true">
      <div className="memory-core"><Layers size={20} /><span>{t("memory.library")}</span><span className="core-count">HTTP + MCP</span></div>
      <div className="memory-connectors"><i /><i /><i /></div>
      <div className="agent-nodes"><span>ChatGPT</span><span>Codex</span><span>Cursor</span></div>
    </div>
  </div>;
  return <div className="project-visual ledger-visual" role="img" aria-label={t("ledger.visual")}>
    <div className="visual-topline"><span className="visual-dot" />{t("ledger.exact")}<span className="visual-glyph">=</span></div>
    <div className="ledger-diagram" aria-hidden="true">
      <div className="currency-row"><span>USD</span><span>EUR</span><span>CNY</span></div>
      <div className="ledger-system"><span><Braces size={19} />{t("ledger.api")}</span><ArrowRight size={17} /><span><Layers size={19} />{t("ledger.client")}</span></div>
      <div className="precision-label"><Check size={12} />{t("ledger.precision")}</div>
    </div>
  </div>;
}

export function Homepage() {
  const t = useCopy();
  return <SiteShell>
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <p className="eyebrow hero-eyebrow"><Asterisk className="asterisk" size={22} aria-hidden="true" />{t("eyebrow")}</p>
        <h1 id="hero-heading">{t("hero.first")}<br /><span>{t("hero.second")}</span></h1>
        <p className="hero-description">{t("hero.description")}</p>
        <div className="hero-actions"><Button asChild className="primary-link"><a href="#projects">{t("hero.explore")}<ArrowDown size={15} aria-hidden="true" /></a></Button><a href={LINKS.github} className="github-link"><Github size={16} aria-hidden="true" />{t("hero.github")}<ArrowUpRight size={13} aria-hidden="true" /></a></div>
      </div>
      <IdeaSketch />
    </section>

    <section className="projects-section" id="projects" aria-labelledby="projects-heading">
      <div className="section-heading"><h2 id="projects-heading"><span className="section-number">01</span>{t("projects.heading")}</h2><p className="eyebrow">{t("projects.note")}</p></div>
      <div className="project-grid">{PROJECTS.map((project, index) => <article className="project-card" key={project.id} aria-labelledby={`${project.id}-title`}>
        <ProjectVisual id={project.id} />
        <div className="project-content">
          <p className="project-category"><span>{String(index + 1).padStart(2, "0")}</span>{t(project.category)}</p>
          <h3 id={`${project.id}-title`}>{t(project.title)}</h3>
          <p className="project-description">{t(project.description)}</p>
          <ul className="project-tags" aria-label={t("technologies")}>{project.tags.map((tag) => <li key={tag}>{tag === "Multi-currency" ? t("tag.multicurrency") : tag}</li>)}</ul>
          <div className="project-links">{project.links.map((link) => <a href={link.href} key={link.href} aria-label={`${t(link.label)} · ${t(project.title)}`}>{t(link.label)}<ArrowUpRight size={15} aria-hidden="true" /></a>)}</div>
        </div>
      </article>)}</div>
      <article className="tools-card" aria-labelledby="tools-title">
        <div className="tools-icon" aria-hidden="true"><Terminal size={22} /></div>
        <div className="tools-body"><div className="tools-heading"><h3 id="tools-title">{t("tools.title")}</h3><span className="stage-badge"><span aria-hidden="true" />{t("tools.stage")}</span></div><p>{t("tools.description")}</p></div>
        <a href={LINKS.tools} className="tools-link" aria-label={`${t("source")} · zeithrold/tools`}><span>{t("source")}</span><ArrowUpRight size={19} aria-hidden="true" /></a>
      </article>
      <p className="section-footnote">{t("tools.note")}</p>
    </section>

    <section className="spaces-section" id="spaces" aria-labelledby="spaces-heading">
      <div className="section-heading"><h2 id="spaces-heading"><span className="section-number">02</span>{t("spaces.heading")}</h2><p className="eyebrow">{t("spaces.note")}</p></div>
      <div className="spaces-grid">
        <a className="space-card" href={LINKS.blog} aria-labelledby="blog-title"><div className="space-icon" aria-hidden="true"><BookOpen size={23} /></div><span className="space-domain">blog.ztd.me</span><h3 id="blog-title">{t("blog.title")}</h3><p>{t("blog.description")}</p><span className="space-visit">{t("visit")}<ArrowUpRight size={18} aria-hidden="true" /></span></a>
        <a className="space-card" href={LINKS.showcase} aria-labelledby="showcase-title"><div className="space-icon showcase-icon" aria-hidden="true"><Sparkles size={23} /></div><span className="space-domain">showcase.ztd.me</span><h3 id="showcase-title">{t("showcase.title")}</h3><p>{t("showcase.description")}</p><span className="space-visit">{t("visit")}<ArrowUpRight size={18} aria-hidden="true" /></span></a>
      </div>
    </section>

    <section className="contact-section" id="contact" aria-labelledby="contact-heading">
      <div><p className="eyebrow">{t("contact.eyebrow")}</p><h2 id="contact-heading">{t("contact.heading")}</h2><p className="contact-description">{t("contact.description")}</p></div>
      <a className="email-link" href={LINKS.email}><Mail size={21} aria-hidden="true" /><span>hello@ztd.me</span><ArrowUpRight size={25} aria-hidden="true" /></a>
    </section>
  </SiteShell>;
}
