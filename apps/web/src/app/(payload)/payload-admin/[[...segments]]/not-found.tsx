/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import { generatePageMetadata, NotFoundPage } from '@payloadcms/next/views'
import type { Metadata } from 'next'
import config from '@dflow/core/payload.config'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({
  params,
  searchParams,
}: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const NotFound = ({ params, searchParams }: Args) =>
  NotFoundPage({ config, params, searchParams, importMap })

export default NotFound
