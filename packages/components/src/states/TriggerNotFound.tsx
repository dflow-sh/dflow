'use client'

import { notFound } from 'next/navigation'
import { useEffect } from 'react'

const TriggerNotFound = () => {
  useEffect(() => {
    notFound()
  }, [])

  return null
}

export default TriggerNotFound
