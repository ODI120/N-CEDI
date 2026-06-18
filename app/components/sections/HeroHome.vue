<script setup lang="ts">
  import MotionWrapper from '~/components/motion/MotionWrapper.vue'
  import TextReveal from '~/components/motion/TextReveal.vue'
  import { resolveTestimonialAvatarUrl } from '~/utils/testimonialAdmin'

  import avatar1 from '~/assets/image/avatar1.webp'
  import avatar2 from '~/assets/image/avatar2.jpg'

  // Badge color themes that cycle for each floating avatar
  const badgeThemes = [
    { class: 'avatar-aisha', cursorColor: '#60A5FA' },
    { class: 'avatar-tunde', cursorColor: '#10B981' },
    { class: 'avatar-david', cursorColor: '#A855F7' },
    { class: 'avatar-chioma', cursorColor: '#EC4899' },
  ]

  interface FloatingAlumni {
    name: string
    avatarUrl: string
  }

  // Static fallbacks in case no testimonials have avatar images
  const fallbackAvatars: FloatingAlumni[] = [
    { name: 'Aisha', avatarUrl: avatar1 },
    { name: 'Tunde', avatarUrl: avatar2 },
    { name: 'David', avatarUrl: avatar2 },
    { name: 'Chioma', avatarUrl: avatar1 },
  ]

  // Fetch 4 random published testimonials that have avatars
  const { data: fetchedAvatars } = useAsyncData<FloatingAlumni[]>(
    'hero-floating-avatars',
    async () => {
      const { client } = useSupabase()

      // Fetch more than needed so we can shuffle and pick 4
      const { data: rows, error } = await client
        .from('testimonials')
        .select('name, avatar_url')
        .eq('is_published', true)
        .not('avatar_url', 'is', null)
        .limit(20)

      if (error || !rows?.length) return []

      // Shuffle and pick up to 4
      const shuffled = [...rows].sort(() => Math.random() - 0.5)
      return shuffled.slice(0, 4).map((row: any) => ({
        name: row.name?.split(' ')[0] || row.name, // Use first name only
        avatarUrl: resolveTestimonialAvatarUrl(row.avatar_url),
      }))
    },
    { default: () => [], lazy: true },
  )

  // Use fetched alumni when available, otherwise show fallback avatars
  const floatingAvatars = computed(() =>
    fetchedAvatars.value && fetchedAvatars.value.length > 0
      ? fetchedAvatars.value
      : fallbackAvatars
  )
</script>

<template>
  <section
    class="hero-home"
    aria-label="Welcome to N-CEDI"
  >
    <div class="hero-home__background">
      <!-- Gradient overlay for visual richness -->
      <div class="hero-home__overlay"></div>

      <!-- Pulse wave (center) -->
      <div class="pulse-wave"></div>

      <!-- Floating avatars with cursor pointers — fetched from alumni -->
      <div
        v-for="(alumni, index) in floatingAvatars"
        :key="index"
        class="floating-avatar"
        :class="`floating-avatar--${index + 1}`"
      >
        <i class="bi bi-cursor-fill"></i>
        <div
          class="floating-avatar__badge"
          :class="badgeThemes[index % badgeThemes.length].class"
        >
          <div class="avatar avatar--1">
            <img :src="alumni.avatarUrl" :alt="`${alumni.name}'s Avatar`" />
          </div>
          <span class="floating-avatar__name" :class="{ float: index === 3 }">{{ alumni.name }}</span>
        </div>
      </div>
    </div>

    <div class="hero-home__container container">
      <div class="hero-home__grid">
        <!-- Left Column: Content -->
        <div class="hero-home__content">
          <MotionWrapper
            variant="fadeUp"
            :delay="200"
            :duration="0.6"
          >
            <span class="eyebrow hero-home__eyebrow center">NCAT Centre for Entrepreneurship <i class="bi bi-airplane-fill"></i></span>
          </MotionWrapper>

          <TextReveal
            text="Empowering Africa's Next Innovators"
            tag="h1"
            :delay="400"
            class="hero-home__title center"
          />

          <MotionWrapper
            variant="fadeUp"
            class="text"
            :delay="800"
            :duration="0.8"
          >
            <p class="hero-home__lead center">
              N-CEDI accelerates high-impact career development through world-class tech training, vocational innovation, and venture incubation.
            </p>
          </MotionWrapper>

          <MotionWrapper
            variant="fadeUp"
            :delay="1000"
            :duration="0.8"
          >
            <div class="hero-home__actions">
              <BaseButton
                class="base-button--primary"
                size="lg"
                to="/programs"
              >
                Explore Programs
                <i class="bi bi-arrow-right-circle"></i>
              </BaseButton>
              <BaseButton
                to="/about"
                class="base-button--secondary"
              >
                Learn More
              </BaseButton>
            </div>
          </MotionWrapper>

          <MotionWrapper
            variant="fadeUp"
            :delay="1200"
            :duration="0.8"
          >
            <div class="hero-home__social-proof">
              <div class="social-proof__avatars">
                <div class="avatar avatar--1">
                  👨‍💼
                </div>
                <div class="avatar avatar--2">
                  👩‍💼
                </div>
                <div class="avatar avatar--3">
                  👨‍💻
                </div>
                <div class="avatar avatar--4">
                  👩‍💻
                </div>
              </div>
              <div class="social-proof__text">
                <span class="social-proof__count">Over 50+ Alumni</span>
              </div>
            </div>
          </MotionWrapper>
        </div>

        <!-- Right Column: Visual -->
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-home {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-top: clamp(100px, 15vh, 160px);
  padding-bottom: var(--section-padding-y);
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fb 100%);
}

.hero-home__background {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero-home__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image:
    /* Grid pattern - visible horizontal and vertical lines */
    linear-gradient(to right, rgba(150, 170, 210, 0.15) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(150, 170, 210, 0.15) 1px, transparent 1px),
    /* Radial gradients for depth */
    radial-gradient(circle at 15% 20%, rgba(2, 86, 255, 0.12) 0%, transparent 40%),
    radial-gradient(circle at 85% 85%, rgba(1, 156, 154, 0.1) 0%, transparent 35%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 70%);

  background-size:
    60px 60px,
    60px 60px,
    auto,
    auto,
    auto;

  background-position:
    0 0,
    0 0,
    0 0,
    0 0,
    0 0;

  pointer-events: none;
}

.hero-home__container {
  position: relative;
  z-index: 3;
  width: 100%;
}

.pulse-wave {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(1);
  width: 100%;
  max-width: 420px;
  aspect-ratio: 1;
  border-radius: 50%;
  pointer-events: none;
  z-index: 2; /* above overlay, under content */
  background: radial-gradient(circle, rgba(2,86,255,0.20) 0%, rgba(2,86,255,0.10) 25%, rgba(2,86,255,0.04) 50%, transparent 60%);
  filter: blur(8px);
  animation: pulse-wave 3800ms cubic-bezier(0.22,0.9,0.31,1) infinite;
}

@keyframes pulse-wave {
  0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.95; }
  40% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.45; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

.hero-home__grid {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-content: center;

  gap: var(--space-12);
}

@media (max-width: 1024px) {
  .hero-home__grid {
    flex-direction: column;
    gap: var(--space-8);
  }

  .floating-avatar--1 {
    top: 10%;
    left: 3%;
  }

  .floating-avatar--2 {
    top: 15%;
    right: 3%;
  }

  .floating-avatar--3 {
    bottom: 15%;
    left: 2%;
  }

  .floating-avatar--4 {
    bottom: 10%;
    right: 3%;
  }
}

@media (max-width: 768px) {
  .hero-home {
    padding-top: 80px;
    padding-bottom: var(--space-8);
  }

  .floating-avatar {
    display: none !important;
  }

  .hero-home__social-proof {
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
  }

  .social-proof__avatars {
    margin-right: 0;
  }

  .text {
    max-width: 100%;
  }

  .hero-home__visual-wrapper {
    aspect-ratio: 16 / 10;
  }
}

.hero-home__content {
  /* max-width: 720px; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hero-home__eyebrow {
  color: #019C9A;
  margin-top: var(--space-6);
  display: inline-block;
  background: linear-gradient(135deg, rgba(1, 156, 154, 0.1) 0%, rgba(2, 86, 255, 0.07) 100%);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  border: 1px solid rgba(1, 156, 154, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-home__eyebrow:hover {
  border-color: rgba(1, 156, 154, 0.4);
  background: linear-gradient(135deg, rgba(1, 156, 154, 0.15) 0%, rgba(2, 86, 255, 0.1) 100%);
  box-shadow: 0 8px 24px rgba(1, 156, 154, 0.12);
  transform: translateY(-2px);
}

.hero-home__title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 8vw, 5.5rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: var(--tracking-tight);
  margin-top: var(--space-2);
  margin-bottom: var(--space-4);
  background-clip: text;
  display: inline-block;
  width: 100%;
  color: var(--color-text-dark);
  text-align: center;
}

@keyframes shimmer {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.05); }
}

/* Floating Avatars - Premium Badge Style */
.floating-avatar {
  position: absolute;
  z-index: 3;
  pointer-events: none;
}

.floating-avatar--1 {
  top: 28%;
  left: 8%;
  animation: float-avatar-1 6s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
}

.floating-avatar--2 {
  top: 35%;
  right: 8%;
  animation: float-avatar-2 6.5s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
}

.floating-avatar--3 {
  bottom: 22%;
  left: 20%;
  animation: float-avatar-3 6.2s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
}

.floating-avatar--4 {
  bottom: 20%;
  right: 20%;
  animation: float-avatar-4 6.8s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
}

.floating-avatar__badge {
  display: flex;
  /* flex-direction: ; */
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 12px 4px 6px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 13px;
  color: white;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* min-width: 100px; */
  text-align: center;
}

.floating-avatar__badge:hover {
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.2) inset;
  transform: translateY(-4px);
}

.floating-avatar__name {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  display: block;
  white-space: nowrap;
}

.floating-avatar__badge .avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color:#fffb07 !important; ;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-left: 0 !important;
  flex-shrink: 0;
  border: transparent !important;
}
.floating-avatar__badge .avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-aisha {
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  box-shadow:
    0 8px 32px rgba(59, 130, 246, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.avatar-david {
  background: linear-gradient(135deg, #A855F7 0%, #7C3AED 100%);
  box-shadow:
    0 8px 32px rgba(168, 85, 247, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.avatar-tunde {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow:
    0 8px 32px rgba(16, 185, 129, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.avatar-chioma {
  background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);
  box-shadow:
    0 8px 32px rgba(236, 72, 153, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.floating-avatar .bi-cursor-fill {
  display: inline-block;
  transform: rotate(280deg);
  font-size: 28px;
  opacity: 0.95;
  position:relative;
  left: -24px;
  bottom: 0px;
}

.floating-avatar--1 i{
  color: #60A5FA;
}
.floating-avatar--2 i {
  color: #A855F7;
}
.floating-avatar--3 i {
  color: #10B981;
}
.floating-avatar--4 i {
  color: #EC4899;
}

@keyframes float-avatar-1 {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 1;
  }
  25% {
    transform: translateY(-15px) translateX(8px);
  }
  50% {
    transform: translateY(-30px) translateX(0px);
  }
  75% {
    transform: translateY(-15px) translateX(-8px);
  }
}

@keyframes float-avatar-2 {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 1;
  }
  25% {
    transform: translateY(12px) translateX(-10px);
  }
  50% {
    transform: translateY(25px) translateX(0px);
  }
  75% {
    transform: translateY(12px) translateX(10px);
  }
}

@keyframes float-avatar-3 {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 1;
  }
  33% {
    transform: translateY(-18px) translateX(-8px);
  }
  66% {
    transform: translateY(-28px) translateX(8px);
  }
}

@keyframes float-avatar-4 {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 1;
  }
  33% {
    transform: translateY(16px) translateX(10px);
  }
  66% {
    transform: translateY(28px) translateX(-8px);
  }
}

.hero-home__lead {
  font-family: var(--font-body);
  font-size: var(--text-md);
  line-height: 1.5;
  color: var(--color-text-muted);
  /* margin-bottom: var(--space-4); */
  max-width: 600px;
  text-align: center;
  /* font-weight: 500; */
  letter-spacing: 0.3px;
}
@media (max-width: 426px) {
  .hero-home__content{
    gap: var(--space-1);
  }
  .hero-home__lead {
    /* font-size: var(--text-sm); */
    max-width: 100%;
  }
  .text {
    width: 100%;
  }
  .hero-home__actions {
    margin-top: var(--space-4);
  }
  .hero-home__title{
    font-size: 3.3rem;
    font-weight: 900!important;
    line-height: 1.1;
  }
  
}

.hero-home__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-5);
  justify-content: center;
  margin-top: var(--space-4);
}

.hero-home__visual {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: var(--space-4);
}

.hero-home__visual-wrapper {
  width: 100%;
  aspect-ratio: 4 / 3;
}

.hero-home__image-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 50%, #f0f7ff 100%);
  border: 1px solid rgba(2, 86, 255, 0.1);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow:
    0 20px 60px rgba(2, 86, 255, 0.08),
    0 0 120px rgba(1, 156, 154, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-home__image-placeholder:hover {
  border-color: rgba(2, 86, 255, 0.2);
  box-shadow:
    0 25px 80px rgba(2, 86, 255, 0.12),
    0 0 150px rgba(1, 156, 154, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.visual-gradient-shim {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(2, 86, 255, 0.08) 0%, rgba(1, 156, 154, 0.06) 100%);
  z-index: 2;
  mix-blend-mode: multiply;
}

/* .placeholder-graphic {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--space-4);
  padding: var(--space-12);
  text-align: center;
}

.placeholder-graphic__icon {
  font-size: 4rem;
  filter: drop-shadow(0 8px 24px rgba(2, 86, 255, 0.2));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}

.placeholder-graphic__text {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  color: #0a0e27;
  letter-spacing: 0.05em;
  text-transform: uppercase;
} */

/* Social Proof Section */
.hero-home__social-proof {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding:10px 16px 10px 10px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(2, 86, 255, 0.1);
  border-radius: var(--radius-full);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.social-proof__avatars {
  display: flex;
  align-items: center;
  margin-right: var(--space-1);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #019C9A 0%, #2563eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-left: -16px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(2, 86, 255, 0.2);
}

.avatar:first-child {
  margin-left: 0;
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
}

.avatar:nth-child(2) {
  background: linear-gradient(135deg, #019C9A 0%, #0d9488 100%);
}

.avatar:nth-child(3) {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.avatar:nth-child(4) {
  background: linear-gradient(135deg, #db2777 0%, #be185d 100%);
}

.social-proof__count {
  font-size: 14px;
  color: var(--color-text-dark);
  font-weight: 500;
}
</style>
