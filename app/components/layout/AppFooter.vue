<script setup lang="ts">
import { ref } from 'vue'
import AppLogo from '~/components/AppLogo.vue'

const email = ref('')
const isSubscribed = ref(false)

const handleSubscribe = () => {
  if (email.value) {
    // In a real application, connect this to server API / newsletter list
    isSubscribed.value = true
    email.value = ''
  }
}
</script>

<template>
  <footer class="app-footer">
    <div class="container">
      <div class="app-footer__grid">
        <!-- Column 1: About -->
        <div class="app-footer__col app-footer__col--about">
          <NuxtLink to="/" aria-label="N-CEDI Home" class="app-footer__logo-link">
            <AppLogo class="app-footer__logo" />
          </NuxtLink>
          <p class="app-footer__description">
            The NCAT Centre for Entrepreneurship Development and Innovation (N-CEDI) is a premier institution empowering the next generation of African leaders, builders, and innovators.
          </p>
        </div>

        <!-- Column 2: Quick Links -->
        <div class="app-footer__col">
          <h4 class="app-footer__title">Institutional</h4>
          <ul class="app-footer__links">
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/about">About Us</NuxtLink></li>
            <li><NuxtLink to="/events">Events & Seminars</NuxtLink></li>
            <li><NuxtLink to="/blog">Blog & Research</NuxtLink></li>
            <li><NuxtLink to="/gallery">Campus Gallery</NuxtLink></li>
            <li><NuxtLink to="/partners">Our Partners</NuxtLink></li>
          </ul>
        </div>

        <!-- Column 3: Programs -->
        <div class="app-footer__col">
          <h4 class="app-footer__title">Programs</h4>
          <ul class="app-footer__links">
            <li><NuxtLink to="/programs">All Courses</NuxtLink></li>
            <li><NuxtLink to="/programs/fashion-design">Fashion Design</NuxtLink></li>
            <li><NuxtLink to="/programs/web-design-development">Web Design & Development</NuxtLink></li>
            <li><NuxtLink to="/programs/solar-installation-energy-systems">Solar Installation</NuxtLink></li>
            <li><NuxtLink to="/programs/computer-hardware-engineering">Computer Hardware</NuxtLink></li>
            <li><NuxtLink to="/contact">Enrollment Inquiry</NuxtLink></li>
          </ul>
        </div>

        <!-- Column 4: Newsletter -->
        <div class="app-footer__col app-footer__col--newsletter">
          <h4 class="app-footer__title">Stay Updated</h4>
          <p class="app-footer__newsletter-desc">Subscribe to receive program launch alerts, event invitations, and innovations insights.</p>
          
          <form @submit.prevent="handleSubscribe" class="newsletter-form">
            <div v-if="isSubscribed" class="newsletter-success">
              ✓ Thank you for subscribing!
            </div>
            <div v-else class="newsletter-input-group">
              <input
                v-model="email"
                type="email"
                placeholder="Enter your email"
                required
                aria-label="Email address for newsletter"
                class="newsletter-input"
              />
              <BaseButton variant="accent" size="sm" type="submit">
                Subscribe
              </BaseButton>
            </div>
          </form>

          <div class="app-footer__socials">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <span class="social-icon">IN</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <span class="social-icon">TW</span>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <span class="social-icon">FB</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <span class="social-icon">IG</span>
            </a>
          </div>
        </div>
      </div>

      <div class="app-footer__divider" />

      <!-- Footer Bottom -->
      <div class="app-footer__bottom">
        <p class="app-footer__copyright">
          &copy; {{ new Date().getFullYear() }} N-CEDI (NCAT Centre for Entrepreneurship Development and Innovation). All rights reserved.
        </p>
        <div class="app-footer__bottom-links">
          <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms">Terms of Service</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  padding-top: var(--space-16);
  padding-bottom: var(--space-8);
  font-family: var(--font-body);
  border-top: 1px solid var(--color-border);
}

.app-footer__grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr;
  gap: var(--space-8);
  margin-bottom: var(--space-12);
}

@media (max-width: 1024px) {
  .app-footer__grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-8);
  }
}

@media (max-width: 600px) {
  .app-footer__grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
}

.app-footer__col {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.app-footer__logo-link {
  display: inline-block;
  align-self: flex-start;
}

.app-footer__logo {
  height: 40px;
  width: auto;
  color: var(--color-brand-primary);
}

.app-footer__description {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: 320px;
}

.app-footer__title {
  color: var(--color-text-dark);
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  letter-spacing: var(--tracking-wide);
  margin-bottom: var(--space-2);
}

.app-footer__links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.app-footer__links a {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: color 0.2s;
}

.app-footer__links a:hover {
  color: var(--color-brand-accent);
}

.app-footer__col--newsletter {
  max-width: 380px;
}

.app-footer__newsletter-desc {
  font-size: var(--text-sm);
  line-height: var(--leading-snug);
  color: var(--color-text-muted);
}

.newsletter-form {
  margin-top: var(--space-1);
  width: 100%;
}

.newsletter-input-group {
  display: flex;
  gap: var(--space-2);
}

.newsletter-input {
  flex: 1;
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  color: var(--color-text-dark);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  outline: none;
  transition: border-color 0.2s, background-color 0.2s;
}

.newsletter-input:focus {
  border-color: var(--color-brand-accent);
  background-color: var(--color-surface-muted);
}

.newsletter-success {
  color: var(--color-brand-accent);
  font-weight: 600;
  font-size: var(--text-sm);
  padding: var(--space-2) 0;
}

.app-footer__socials {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background-color: var(--color-surface-muted);
  color: var(--color-text-dark);
  font-size: var(--text-xs);
  font-weight: 700;
  transition: background-color 0.2s, color 0.2s;
}

.social-icon:hover {
  background-color: var(--color-brand-primary);
  color: var(--color-text-light);
}

.app-footer__divider {
  width: 100%;
  height: 1px;
  background-color: var(--color-border);
  margin-top: var(--space-12);
  margin-bottom: var(--space-6);
}

.app-footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .app-footer__bottom {
    flex-direction: column;
    gap: var(--space-4);
    text-align: center;
  }
}

.app-footer__copyright {
  margin: 0;
}

.app-footer__bottom-links {
  display: flex;
  gap: var(--space-4);
}

.app-footer__bottom-links a {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.app-footer__bottom-links a:hover {
  color: var(--color-brand-accent);
}
</style>
