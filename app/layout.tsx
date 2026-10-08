import type { Metadata } from 'next'
import type { ReactElement, ReactNode } from 'react'
import { headers } from 'next/headers'
import { frontendRootAttributes } from '@/components/ui/ztd-me/index'
import { WebsiteFrontend } from '@/components/website-frontend'
import { en, zh } from '@/lib/copy'
import { resolveWebsiteFrontend } from '@/lib/website-frontend'
import './globals.css'

const SCROLL_SMOOTH_CLASS = [
  'scroll-smooth scroll-pt-8 motion-reduce:scroll-auto [color-scheme:var(--ztd-color-scheme)]',
].join(' ')

const M_0_CLASS = ['m-0 min-w-80 bg-background font-sans text-body text-foreground [font-synthesis:none]'].join(' ')

const baseMetadata: Metadata = {
  title: 'Zeithrold — Projects, experiments & notes',
  description: en['meta.description'],
  metadataBase: new URL('https://ztd.me'),
  alternates: { canonical: '/' },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Zeithrold',
    description: en['meta.description'],
    url: 'https://ztd.me',
    type: 'website',
    images: [
      { url: '/og.png', width: 1200, height: 630, alt: 'Zeithrold — Ideas into useful things.' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zeithrold',
    description: en['meta.description'],
    images: ['/og.png'],
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const { initialPreferences } = resolveWebsiteFrontend(await headers())
  const copy = initialPreferences.locale === 'zh-CN' ? zh : en
  const description = copy['meta.description']
  return {
    ...baseMetadata,
    description,
    openGraph: { ...baseMetadata.openGraph, description },
    twitter: { ...baseMetadata.twitter, description },
  }
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>): Promise<ReactElement> {
  const props = resolveWebsiteFrontend(await headers())
  return (
    <html className={SCROLL_SMOOTH_CLASS} {...frontendRootAttributes(props.initialPreferences)}>
      <body className={M_0_CLASS}><WebsiteFrontend {...props}>{children}</WebsiteFrontend></body>
    </html>
  )
}
