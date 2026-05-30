import { computed, onMounted, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { resolveGalleryMediaUrl } from '~/utils/galleryAdmin'

/** Resolve a gallery media ref or URL for display (re-runs after mount for client URL). */
export function useGalleryMediaSrc(mediaRef: MaybeRefOrGetter<string | undefined | null>) {
  const hydrated = ref(false)
  onMounted(() => {
    hydrated.value = true
  })

  return computed(() => {
    hydrated.value
    const ref = toValue(mediaRef)
    if (!ref?.trim()) return ''
    return resolveGalleryMediaUrl(ref)
  })
}

/** Batch-resolve gallery items for grids (client re-resolve after hydration). */
export function useGalleryDisplayItems<T extends { mediaUrl: string }>(
  items: MaybeRefOrGetter<T[]>,
) {
  const hydrated = ref(false)
  onMounted(() => {
    hydrated.value = true
  })

  return computed(() => {
    hydrated.value
    return toValue(items).map((item) => ({
      ...item,
      mediaUrl: resolveGalleryMediaUrl(item.mediaUrl),
    }))
  })
}
