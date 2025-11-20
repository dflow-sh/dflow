'use client'

import { ThemeProvider } from 'next-themes'
import Link from 'next/link'

export default function Forbidden() {
  return (
    <ThemeProvider enableSystem attribute='class'>
      <main className='forbidden-page'>
        <h2 className='forbidden-title'>403</h2>
        <p className='forbidden-message'>
          You do not have permission to access this resource.
        </p>

        <Link href='/'>
          <button className='forbidden-button'>Back To Dashboard</button>
        </Link>

        <style jsx global>{`
          html,
          body,
          #__next {
            margin: 0;
            padding: 0;
            height: 100%;
          }
        `}</style>

        <style jsx>{`
          .forbidden-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
            text-align: center;
            box-sizing: border-box;
          }

          .forbidden-title {
            color: #6e56cf;
            font-size: 5rem;
            font-weight: 600;
            margin: 0.5rem 0;
          }

          .forbidden-message {
            font-size: 1.1rem;
            margin: 1rem 0;
          }

          .forbidden-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 500;
            border-radius: 0.5rem;
            background: #6e56cf;
            border: none;
            color: #ffffff;
            height: 36px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition:
              filter 0.2s ease,
              transform 0.2s ease,
              box-shadow 0.2s ease;
            cursor: pointer;
          }
        `}</style>
      </main>
    </ThemeProvider>
  )
}
