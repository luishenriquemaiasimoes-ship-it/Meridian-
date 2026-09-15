import { inflateRawSync } from 'node:zlib';

/* ==================================================================
   A minimal ZIP reader.

   The CVM publishes every filing as a zipped set of CSVs, so reading
   Brazilian statements starts with unzipping. Node has the hard part
   already — zlib does the inflating — and what is left is walking the
   central directory, which is about sixty lines. That is cheaper than
   a dependency, and unlike everything else in this folder it can be
   tested here rather than only on a machine with a network.

   Only the two compression methods the CVM actually uses are
   supported: stored and deflate. Anything else is reported by name
   rather than silently returning an empty file.
   ================================================================== */

export interface ZipEntry {
  name: string;
  /** Decompressed bytes. */
  data: Buffer;
}

const LOCAL_HEADER = 0x04034b50;
const CENTRAL_HEADER = 0x02014b50;
const END_OF_CENTRAL = 0x06054b50;

/** The end-of-central-directory record sits in the last 64KB, after a variable comment. */
function findEndOfCentralDirectory(buf: Buffer): number {
  const floor = Math.max(0, buf.length - 0x10000 - 22);
  for (let i = buf.length - 22; i >= floor; i--) {
    if (buf.readUInt32LE(i) === END_OF_CENTRAL) return i;
  }
  return -1;
}

export class ZipError extends Error {}

/**
 * Reads every entry. Names are decoded as UTF-8 or CP437 per the ZIP flag,
 * which matters because the CVM's filenames carry accented Portuguese.
 */
export function readZip(buf: Buffer): ZipEntry[] {
  const eocd = findEndOfCentralDirectory(buf);
  if (eocd < 0) {
    throw new ZipError(`not a zip archive: no end-of-central-directory in ${buf.length} bytes`);
  }

  const count = buf.readUInt16LE(eocd + 10);
  let offset = buf.readUInt32LE(eocd + 16);
  const entries: ZipEntry[] = [];

  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(offset) !== CENTRAL_HEADER) {
      throw new ZipError(`central directory entry ${i} has a bad signature`);
    }
    const flags = buf.readUInt16LE(offset + 8);
    const method = buf.readUInt16LE(offset + 10);
    const compressedSize = buf.readUInt32LE(offset + 20);
    const nameLength = buf.readUInt16LE(offset + 28);
    const extraLength = buf.readUInt16LE(offset + 30);
    const commentLength = buf.readUInt16LE(offset + 32);
    const localOffset = buf.readUInt32LE(offset + 42);
    // Bit 11 declares the name is UTF-8; without it the spec says CP437, and
    // latin1 is the closest decoder Node has for the range the CVM uses.
    const name = buf.toString(flags & 0x800 ? 'utf8' : 'latin1', offset + 46, offset + 46 + nameLength);

    if (buf.readUInt32LE(localOffset) !== LOCAL_HEADER) {
      throw new ZipError(`local header for ${name} has a bad signature`);
    }
    // The local header repeats the name and extra fields at its own lengths,
    // which need not match the ones in the central directory.
    const localNameLength = buf.readUInt16LE(localOffset + 26);
    const localExtraLength = buf.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const raw = buf.subarray(start, start + compressedSize);

    if (!name.endsWith('/')) {
      if (method === 0) {
        entries.push({ name, data: Buffer.from(raw) });
      } else if (method === 8) {
        entries.push({ name, data: inflateRawSync(raw) });
      } else {
        throw new ZipError(`${name} uses compression method ${method}, which is not supported`);
      }
    }

    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

/** The first entry whose name matches, or null. */
export function entryMatching(entries: ZipEntry[], pattern: RegExp): ZipEntry | null {
  return entries.find((e) => pattern.test(e.name)) ?? null;
}
