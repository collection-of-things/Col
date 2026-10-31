import { createSignal, onCleanup } from 'solid-js'

const COPIED_RESET_MS = 2000

const hasAsyncClipboard =
    typeof navigator !== 'undefined' &&
    !!navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'

/**
 * Copy text to clipboard and show "copied" feedback for a short time.
 * Returns [copy, copied, status] where status is 'idle' | 'copied' | 'error'.
 */
export function useCopyToClipboard(): [
    (text: string) => Promise<boolean>,
    () => boolean,
    () => 'idle' | 'copied' | 'error',
] {
    const [status, setStatus] = createSignal<'idle' | 'copied' | 'error'>('idle')
    const copied = () => status() === 'copied'
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    function setCopiedWithReset() {
        if (timeoutId) clearTimeout(timeoutId)
        setStatus('copied')
        timeoutId = setTimeout(() => {
            setStatus('idle')
            timeoutId = undefined
        }, COPIED_RESET_MS)
    }

    function setError() {
        if (timeoutId) clearTimeout(timeoutId)
        setStatus('error')
        timeoutId = setTimeout(() => {
            setStatus('idle')
            timeoutId = undefined
        }, COPIED_RESET_MS)
    }

    onCleanup(() => {
        if (timeoutId) clearTimeout(timeoutId)
    })

    function fallbackCopy(text: string): boolean {
        if (typeof document === 'undefined' || !document.body) return false
        const ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        try {
            ta.focus()
            ta.select()
            ta.setSelectionRange(0, ta.value.length) // mobile Safari fallback: select() alone is sometimes ignored on textareas
            return document.execCommand('copy')
        } catch {
            return false
        } finally {
            ta.parentNode?.removeChild(ta)
        }
    }

    async function copy(text: string): Promise<boolean> {
        if (hasAsyncClipboard) {
            try {
                await navigator.clipboard.writeText(text)
                setCopiedWithReset()
                return true
            } catch {
                /* Permission denied or gesture requirement — try fallback. */
            }
        }
        const ok = fallbackCopy(text)
        if (ok) {
            setCopiedWithReset()
        } else {
            setError()
        }
        return ok
    }

    return [copy, copied, status]
}
