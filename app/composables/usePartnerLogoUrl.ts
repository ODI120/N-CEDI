import { computed, onMounted, ref, toValue, type MaybeRefOrGetter } from 'vue'
import {
  mapPartnerToSectionDisplay,
  resolvePartnerLogoUrl,
  type SectionPartnerDisplay,
} from '~/utils/partnerAdmin'
import type { Partner } from '~/types'

export function usePartnerLogoSrc(logoRef: MaybeRefOrGetter<string | undefined | null>) {
  const hydrated = ref(false)
  onMounted(() => {
    hydrated.value = true
  })

  return computed(() => {
    hydrated.value
    const ref = toValue(logoRef)
    if (!ref?.trim()) return ''
    return resolvePartnerLogoUrl(ref)
  })
}

export function useResolvedSectionPartners(
  partners: MaybeRefOrGetter<SectionPartnerDisplay[]>,
) {
  const hydrated = ref(false)
  onMounted(() => {
    hydrated.value = true
  })

  return computed((): SectionPartnerDisplay[] => {
    hydrated.value
    return toValue(partners).map((partner) => ({
      ...partner,
      logoUrl: resolvePartnerLogoUrl(partner.logoUrl) || partner.logoUrl,
    }))
  })
}

export function usePartnersForDisplay(partners: MaybeRefOrGetter<Partner[]>) {
  const hydrated = ref(false)
  onMounted(() => {
    hydrated.value = true
  })

  return computed((): SectionPartnerDisplay[] => {
    hydrated.value
    return toValue(partners).map((partner) => {
      const display = mapPartnerToSectionDisplay(partner)
      return {
        ...display,
        logoUrl: resolvePartnerLogoUrl(partner.logoUrl),
      }
    })
  })
}
