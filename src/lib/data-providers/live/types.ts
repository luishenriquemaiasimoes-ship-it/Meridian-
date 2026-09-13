/* ==================================================================
   Real sources.

   Everything here talks to a public endpoint that publishes what a
   company or a central bank actually filed. There is one rule and the
   rest follows from it: a source that cannot answer says so. It never
   substitutes, never interpolates, never falls back to a neighbouring
   period, and never returns a shape the caller cannot tell apart from
   a real answer.

   That is why every call returns a Fetched<T> rather than a T or null.
   A null tells the caller nothing about whether the company has no
   such figure, the network was down, or the parser did not recognise
   the layout — and those three want different handling. The product
   already carries provenance on every stored value; this is the same
   discipline one layer earlier, at the point the value enters.
   ================================================================== */

export interface Provenance {
  /** Who published it, named the way it should appear to an analyst. */
  source: string;
  /** The exact URL the value came from, so a reader can go and check. */
  url: string;
  /** The date the DATA refers to, not the date it was fetched. */
  asOf: string;
}

export type Fetched<T> =
  | { ok: true; value: T; provenance: Provenance }
  | { ok: false; reason: string; url: string };

export const ok = <T>(value: T, provenance: Provenance): Fetched<T> =>
  ({ ok: true, value, provenance });

export const failed = <T>(url: string, reason: string): Fetched<T> =>
  ({ ok: false, reason, url });

/** Unwraps to a value or null, for callers that genuinely only want the number. */
export function valueOf<T>(f: Fetched<T>): T | null {
  return f.ok ? f.value : null;
}

/** The reason a fetch failed, or null when it did not. */
export function reasonOf<T>(f: Fetched<T>): string | null {
  return f.ok ? null : f.reason;
}
