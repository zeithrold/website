import type { Metadata } from 'next'
import type { ReactElement, ReactNode } from 'react'
import { headers } from 'next/headers'
import { frontendRootAttributes } from '@/components/ui/ztd-me/index'
import { WebsiteFrontend } from '@/components/website-frontend'
import { en, zh } from '@/lib/copy'
import { resolveWebsiteFrontend } from '@/lib/website-frontend'
import '@/components/ui/ztd-me/styles.css'
import './globals.css'

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
    <html {...frontendRootAttributes(props.initialPreferences)}>
      <body><WebsiteFrontend {...props}>{children}</WebsiteFrontend></body>
    </html>
  )
}
