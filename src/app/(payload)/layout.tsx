import configPromise from '../../payload.config'
import '@payloadcms/next/css'
import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import { serverFunction } from './cms/serverFunction'
import { importMap } from './cms/importMap.js'

export const metadata = {
  title: 'Payload Admin',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={configPromise} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
