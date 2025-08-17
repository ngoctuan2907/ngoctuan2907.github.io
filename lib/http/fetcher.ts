"use client"

import { toast } from "@/components/ui/use-toast"

export interface FetcherOptions extends RequestInit {
  showErrorToast?: boolean
  redirectOn401?: boolean
}

/**
 * Enhanced fetch wrapper with auth error handling
 */
export async function fetcher(url: string, options: FetcherOptions = {}): Promise<Response> {
  const {
    showErrorToast = true,
    redirectOn401 = true,
    ...fetchOptions
  } = options

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    // Handle 401 Unauthorized - session expired
    if (response.status === 401 && redirectOn401) {
      if (showErrorToast) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        })
      }

      // Redirect to signin with current path as next parameter
      const currentPath = window.location.pathname + window.location.search
      const signInUrl = `/auth/signin?next=${encodeURIComponent(currentPath)}`
      
      // Use setTimeout to ensure toast is shown before redirect
      setTimeout(() => {
        window.location.href = signInUrl
      }, 1000)
      
      throw new Error("Session expired")
    }

    // Handle other error responses
    if (!response.ok && showErrorToast) {
      const errorData = await response.json().catch(() => ({ message: "An error occurred" }))
      
      toast({
        title: "Request Failed",
        description: errorData.message || `Request failed with status ${response.status}`,
        variant: "destructive",
      })
    }

    return response
  } catch (error: any) {
    if (showErrorToast && error.message !== "Session expired") {
      toast({
        title: "Network Error",
        description: error.message || "Failed to connect to the server.",
        variant: "destructive",
      })
    }
    throw error
  }
}

/**
 * Convenience method for JSON GET requests
 */
export async function fetchJson<T = any>(url: string, options?: FetcherOptions): Promise<T> {
  const response = await fetcher(url, { method: 'GET', ...options })
  return response.json()
}

/**
 * Convenience method for JSON POST requests
 */
export async function postJson<T = any>(url: string, data: any, options?: FetcherOptions): Promise<T> {
  const response = await fetcher(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  })
  return response.json()
}

/**
 * Convenience method for JSON PUT requests
 */
export async function putJson<T = any>(url: string, data: any, options?: FetcherOptions): Promise<T> {
  const response = await fetcher(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  })
  return response.json()
}

/**
 * Convenience method for DELETE requests
 */
export async function deleteRequest<T = any>(url: string, options?: FetcherOptions): Promise<T> {
  const response = await fetcher(url, { method: 'DELETE', ...options })
  return response.json()
}