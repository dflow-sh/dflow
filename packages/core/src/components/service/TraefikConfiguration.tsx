'use client'

import Editor from '@monaco-editor/react'
import { Suspense } from 'react'

const TraefikConfiguration = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Editor
        height='90vh'
        defaultLanguage='json'
        defaultValue='{}'
        theme='vs-dark'
      />
    </Suspense>
  )
}

export default TraefikConfiguration
