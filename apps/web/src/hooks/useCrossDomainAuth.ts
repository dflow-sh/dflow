// src/hooks/useCrossDomainAuth.ts
import { useRouter } from 'next/navigation'

interface CrossDomainAuthOptions {
  domains: string[]
  logoutEndpoint?: string
  loginEndpoint?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
  timeout?: number
}

export function useCrossDomainAuth({
  domains,
  logoutEndpoint = '/api/logout', // Payload endpoint
  loginEndpoint = '/api/login-sync', // Payload endpoint
  onSuccess,
  onError,
  timeout = 3000,
}: CrossDomainAuthOptions) {
  const router = useRouter()

  const createAuthIframe = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.src = url

      const cleanup = () => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
      }

      const timeoutId = setTimeout(() => {
        cleanup()
        resolve() // Don't reject on timeout
      }, timeout)

      iframe.onload = () => {
        clearTimeout(timeoutId)
        cleanup()
        resolve()
      }

      iframe.onerror = () => {
        clearTimeout(timeoutId)
        cleanup()
        reject(new Error(`Failed to load ${url}`))
      }

      document.body.appendChild(iframe)
    })
  }

  const crossDomainLogout = async (redirectUrl?: string) => {
    try {
      const logoutPromises = domains.map(domain =>
        createAuthIframe(`https://${domain}${logoutEndpoint}`),
      )

      await Promise.allSettled(logoutPromises)

      onSuccess?.()

      if (redirectUrl) {
        router.push(redirectUrl)
      }
    } catch (error) {
      onError?.(error as Error)
    }
  }

  const crossDomainLoginSync = async (token?: string, redirectUrl?: string) => {
    try {
      const loginPromises = domains.map(domain => {
        const url = token
          ? `https://${domain}${loginEndpoint}?token=${encodeURIComponent(token)}`
          : `https://${domain}${loginEndpoint}`
        return createAuthIframe(url)
      })

      await Promise.allSettled(loginPromises)

      onSuccess?.()

      if (redirectUrl) {
        router.push(redirectUrl)
      }
    } catch (error) {
      onError?.(error as Error)
    }
  }

  return {
    crossDomainLogout,
    crossDomainLoginSync,
  }
}
