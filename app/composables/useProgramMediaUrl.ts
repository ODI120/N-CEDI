import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { resolveProgramMediaUrl } from '~/utils/programAdmin'

const DEFAULT_PROGRAM_COVER = '/og/default.jpg'

/** Resolve a DB storage ref to a public URL for program cover images. */
export function useProgramCoverSrc(storageRef: MaybeRefOrGetter<string | undefined | null>) {
  return computed(() => resolveProgramMediaUrl(toValue(storageRef)) || DEFAULT_PROGRAM_COVER)
}

/** Resolve gallery storage refs for the program detail page. */
export function useProgramGallerySrcs(storageRefs: MaybeRefOrGetter<string[] | undefined | null>) {
  return computed(() => {
    const refs = toValue(storageRefs)
    if (!refs?.length) return []
    return refs
      .map((ref) => resolveProgramMediaUrl(ref))
      .filter((url): url is string => Boolean(url))
  })
}

export function resolveProgramCoverForSeo(storageRef?: string | null): string | undefined {
  const url = resolveProgramMediaUrl(storageRef)
  return url || undefined
}
