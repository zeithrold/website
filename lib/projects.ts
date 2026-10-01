import type { CopyKey } from "./copy";

// Editorial selection, not a live activity feed. Evidence and edit policy: docs/content.md.
export const PROJECTS = [
  {
    id: "memory", title: "memory.title", category: "memory.category", description: "memory.description",
    tags: ["vinext", "Cloudflare", "MCP"],
    links: [{ href: "https://github.com/zeithrold/memory", label: "source" }],
  },
  {
    id: "ledger", title: "ledger.title", category: "ledger.category", description: "ledger.description",
    tags: ["Go", "Flutter", "Multi-currency"],
    links: [{ href: "https://github.com/zeithrold/ledger", label: "source" }, { href: "https://github.com/zeithrold/ledger-app", label: "ledger.app" }],
  },
] as const satisfies readonly {
  id: string; title: CopyKey; category: CopyKey; description: CopyKey; tags: readonly string[];
  links: readonly { href: string; label: CopyKey }[];
}[];

export const LINKS = {
  github: "https://github.com/zeithrold",
  tools: "https://github.com/zeithrold/tools",
  blog: "https://blog.ztd.me",
  showcase: "https://showcase.ztd.me",
  email: "mailto:hello@ztd.me",
} as const;
