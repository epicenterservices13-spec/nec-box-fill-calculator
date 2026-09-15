import { BoxFillInputs } from '../types/nec';

// Calculations travel as a base64url payload in the URL hash — no backend, no
// router, and the link survives being pasted into a text message to the inspector.
const HASH_PREFIX = '#s=';

function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(encoded: string): string {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeInputs(inputs: BoxFillInputs): string {
  return toBase64Url(JSON.stringify(inputs));
}

export function decodeInputs(encoded: string): Partial<BoxFillInputs> | null {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded));
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function buildShareUrl(inputs: BoxFillInputs): string {
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}${HASH_PREFIX}${encodeInputs(inputs)}`;
}

// Reads a shared calculation out of the current URL, if there is one.
export function readInputsFromHash(): Partial<BoxFillInputs> | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return null;
  return decodeInputs(hash.slice(HASH_PREFIX.length));
}

export function clearHash(): void {
  if (typeof window === 'undefined') return;
  const { origin, pathname, search } = window.location;
  window.history.replaceState(null, '', `${origin}${pathname}${search}`);
}
