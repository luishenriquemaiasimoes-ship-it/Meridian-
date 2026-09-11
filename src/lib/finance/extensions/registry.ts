import type { CompanyClassification, SectorExtension } from './types';

/* ==================================================================
   The extension registry.

   Deliberately empty of industries. The product ships the framework,
   not a set of opinions about which sectors matter: an extension is
   written for the case in hand, registered by the workspace, and
   offered to the analyst, who decides whether to use it.

   A registry with, say, a banking module built in would make banking a
   first-class citizen and everything else an afterthought. This one has
   no citizens.
   ================================================================== */

const REGISTRY = new Map<string, SectorExtension>();

export function registerExtension(extension: SectorExtension): void {
  REGISTRY.set(extension.id, extension);
}

export function unregisterExtension(id: string): void {
  REGISTRY.delete(id);
}

export function getExtension(id: string): SectorExtension | null {
  return REGISTRY.get(id) ?? null;
}

export function listExtensions(): SectorExtension[] {
  return Array.from(REGISTRY.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Extensions whose `appliesWhen` matches. Matching means "offer this", never
 * "use this": the generic model remains the default for every company until
 * the analyst chooses otherwise.
 */
export function suggestExtensions(c: CompanyClassification): SectorExtension[] {
  return listExtensions().filter((e) => {
    if (!e.appliesWhen) return false;
    try {
      return e.appliesWhen(c);
    } catch {
      return false;
    }
  });
}

export function clearExtensions(): void {
  REGISTRY.clear();
}
