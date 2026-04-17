/**
 * useInstallPrompt — exposes the browser's PWA install flow.
 *
 * On Chrome/Edge/Android: listens for `beforeinstallprompt`, stashes the
 * event, and exposes a `promptInstall()` function. Calling it triggers
 * the native install dialog.
 *
 * On iOS Safari: `beforeinstallprompt` is never fired. We detect iOS via
 * the user agent so the UI can show a "Tap Share > Add to Home Screen"
 * hint instead of an install button.
 *
 * The hook also detects "already installed" (standalone display mode)
 * so we hide the install button for users who've already installed.
 */
import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface InstallPromptState {
  /** True when the browser has a native install prompt ready. */
  canInstall: boolean
  /** True on iOS Safari — no native prompt, manual add-to-home-screen only. */
  isIOS: boolean
  /** True if the app is already running as an installed PWA. */
  isStandalone: boolean
  /** Trigger the native install prompt. Returns the user's choice. */
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  // iPadOS 13+ reports as Mac — check for touch to distinguish
  const isIPadOS =
    ua.includes('Mac') &&
    typeof document !== 'undefined' &&
    'ontouchend' in document
  return isIOS || isIPadOS
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // iOS Safari reports standalone via a nonstandard property
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true
}

export function useInstallPrompt(): InstallPromptState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(detectStandalone)

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }

    function onInstalled() {
      setDeferred(null)
      setIsStandalone(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferred) return 'unavailable'
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    setDeferred(null)
    return outcome
  }, [deferred])

  return {
    canInstall: deferred !== null,
    isIOS: detectIOS(),
    isStandalone,
    promptInstall,
  }
}
