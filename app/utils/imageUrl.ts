/**
 * N-CEDI — Supabase Storage image URL builder
 *
 * Prefer `resolveStorageRef` / `getStoragePublicUrl` from `~/utils/storage` for
 * bucket-aware URLs. This module remains for backward-compatible `getImageUrl`.
 */

import {
  STORAGE_BUCKETS,
  getStoragePublicUrl,
  type ImageTransformOptions,
  type StorageBucketId,
} from '~/utils/storage'

export type { ImageTransformOptions }

/**
 * @param path Object path inside the bucket (not a storage ref).
 * @param options Image transform query params.
 * @param bucket Defaults to `media` for legacy callers.
 */
export function getImageUrl(
  path: string,
  options?: ImageTransformOptions,
  bucket: StorageBucketId = STORAGE_BUCKETS.media,
): string {
  return getStoragePublicUrl(bucket, path, options)
}
