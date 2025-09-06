import { Service } from '@/payload-types'

type TemplateType = {
  name: string
  description: string
  services: Service[]
}

export async function fetchOfficialTemplateByName({
  name = '',
}: {
  name: string
}) {
  const res = await fetch(
    `https://dflow.sh/api/templates?where[and][0][name][equals]=${encodeURIComponent(name)}&where[and][1][type][equals]=official`,
  )

  if (!res.ok) {
    throw new Error(`Failed to fetch ${name} template`)
  }

  const data = await res.json()
  return data.docs[0] as TemplateType
}
