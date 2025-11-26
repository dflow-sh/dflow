import configPromise from "@core/payload.config"
import { getPayload } from 'payload'

import { checkBeszelConfig } from "@core/actions/beszel/utils"
import { BeszelClient } from "@core/lib/beszel/client/BeszelClient"
import { Collections } from "@core/lib/beszel/types"

const populateBeszelSystemIds = async () => {
  try {
    const payload = await getPayload({ config: configPromise })
    const config = checkBeszelConfig()

    if (!config.configured) {
      throw new Error(`Missing Beszel config: ${config.missing?.join(', ')}`)
    }

    const client = await BeszelClient.createWithSuperuserAuth(
      config.monitoringUrl,
      config.superuserEmail,
      config.superuserPassword,
    )

    const systems = await client.getFullList({
      collection: Collections.SYSTEMS,
    })

    const promises = systems.map(async system => {
      return payload.update({
        collection: 'servers',
        where: {
          or: [
            {
              name: {
                equals: system.name,
              },
              hostname: {
                equals: system.host,
              },
            },
          ],
        },
        data: {
          beszel: { systemId: system.id },
        },
        trash: true,
      })
    })
    await Promise.all(promises)

    console.log('Fetched systems from Beszel:', systems.length)
    process.exit(0)
  } catch (error) {
    console.error('Error populating Beszel system IDs:', error)
    process.exit(1)
  }
}

populateBeszelSystemIds()
