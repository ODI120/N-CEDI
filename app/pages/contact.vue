<script setup lang="ts">
  import { ref } from 'vue'
  import HeroInner from '~/components/sections/HeroInner.vue'
  import MotionWrapper from '~/components/motion/MotionWrapper.vue'
  import BaseButton from '~/components/ui/BaseButton.vue'
  import { usePageSeo } from '~/composables/useSeo'

  usePageSeo({
    title: 'Contact N-CEDI | Vocational Training Centre Zaria',
    description: 'Reach out to the N-CEDI campus administration in Kaduna. Submit general inquiries, enrollment questions, or partnership proposals.'
  })

  // Add Organization schema with contact details
  useSchemaOrg([
    defineOrganization({
      name: 'N-CEDI',
      url: 'https://n-cedi.vercel.app',
      logo: 'https://n-cedi.vercel.app/logo.webp',
      description: 'NCAT Centre for Entrepreneurship Development and Innovation',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Zaria',
        addressRegion: 'Kaduna State',
        addressCountry: 'NG'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+234 803 123 4567',
        email: 'info@ncedi.edu.ng',
        contactType: 'general',
        areaServed: 'NG'
      }
    })
  ])

  const breadcrumbs = [
    { label: 'Contact', to: '/contact' }
  ]

  const form = ref({
    name: '',
    email: '',
    phone: '',
    subject: '',
    type: 'general' as 'general' | 'partnership' | 'enrollment' | 'media',
    message: ''
  })

  const submitting = ref(false)
  const submitSuccess = ref(false)
  const submitError = ref('')

  const handleSubmit = async () => {
    submitting.value = true
    submitSuccess.value = false
    submitError.value = ''
    
    try {
      const response = await $fetch('/api/contact', {
        method: 'POST',
        body: form.value
      })
      
      if (response?.success) {
        submitSuccess.value = true
        form.value = {
          name: '',
          email: '',
          phone: '',
          subject: '',
          type: 'general',
          message: ''
        }
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (err: any) {
      console.error('Contact submit error:', err)
      submitError.value = err.data?.statusMessage || err.message || 'An error occurred during submission. Please try again.'
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <div class="contact-page">
    <HeroInner
      title="Contact Our Centre"
      subtitle="Have questions about track allocation, sponsorship tiers, or our facilities? Get in touch with our administrative team."
      :breadcrumbs="breadcrumbs"
    />

    <section class="contact-section">
      <div class="container contact-grid">
        <!-- Contact Information Column -->
        <div class="contact-info">
          <MotionWrapper variant="slideRight" :delay="100">
            <div class="contact-info-card">
              <h2 class="contact-info-title">Institutional Location</h2>
              
              <div class="info-list">
                <div class="info-item">
                  <div class="info-item__icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div class="info-item__content">
                    <h3 class="info-item__label">Campus Address</h3>
                    <p class="info-item__value">
                      NCAT Campus, Centre for Entrepreneurship Development & Innovation,<br />
                      Zaria, Kaduna State, Nigeria.
                    </p>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-item__icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div class="info-item__content">
                    <h3 class="info-item__label">Email Communications</h3>
                    <p class="info-item__value">
                      <a href="mailto:info@ncedi.edu.ng">info@ncedi.edu.ng</a><br />
                      <a href="mailto:academic@ncedi.edu.ng">academic@ncedi.edu.ng</a>
                    </p>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-item__icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div class="info-item__content">
                    <h3 class="info-item__label">Phone Helplines</h3>
                    <p class="info-item__value">
                      +234 803 123 4567<br />
                      +234 805 765 4321
                    </p>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-item__icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="info-icon">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div class="info-item__content">
                    <h3 class="info-item__label">Administrative Hours</h3>
                    <p class="info-item__value">
                      Monday – Friday: 8:00 AM – 4:00 PM<br />
                      Weekends: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </MotionWrapper>
        </div>

        <!-- Contact Form Column -->
        <div class="contact-form-wrapper">
          <MotionWrapper variant="slideLeft" :delay="200">
            <form class="contact-form" @submit.prevent="handleSubmit">
              <h2 class="contact-form-title">Send a Message</h2>
              
              <!-- Success Alert -->
              <div v-if="submitSuccess" class="alert alert--success" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="alert-icon">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <div class="alert-text">
                  <strong>Success!</strong> Your inquiry has been submitted. Our team will contact you shortly.
                </div>
              </div>

              <!-- Error Alert -->
              <div v-if="submitError" class="alert alert--error" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="alert-icon">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div class="alert-text">
                  <strong>Submission Failed:</strong> {{ submitError }}
                </div>
              </div>

              <!-- Grid Fields -->
              <div class="form-row">
                <div class="form-group">
                  <label for="name" class="form-label">Full Name <span class="required">*</span></label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    required
                    class="form-input"
                    placeholder="Enter your name"
                  />
                </div>

                <div class="form-group">
                  <label for="email" class="form-label">Email Address <span class="required">*</span></label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    required
                    class="form-input"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="phone" class="form-label">Phone Number</label>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    class="form-input"
                    placeholder="e.g. +234 80..."
                  />
                </div>

                <div class="form-group">
                  <label for="type" class="form-label">Inquiry Classification</label>
                  <select
                    id="type"
                    v-model="form.type"
                    class="form-input"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="enrollment">Academic Track Allocation</option>
                    <option value="partnership">Strategic Partnership</option>
                    <option value="media">Media / Press Relation</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="subject" class="form-label">Subject</label>
                <input
                  id="subject"
                  v-model="form.subject"
                  type="text"
                  class="form-input"
                  placeholder="Enter message subject"
                />
              </div>

              <div class="form-group">
                <label for="message" class="form-label">Your Message <span class="required">*</span></label>
                <textarea
                  id="message"
                  v-model="form.message"
                  required
                  rows="6"
                  class="form-input form-textarea"
                  placeholder="Enter details of your inquiry..."
                ></textarea>
              </div>

              <BaseButton variant="primary" type="submit" block size="lg" :disabled="submitting">
                <span v-if="submitting">Sending Message...</span>
                <span v-else>Send Message</span>
              </BaseButton>
            </form>
          </MotionWrapper>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.contact-page {
  background-color: var(--color-surface);
}

.contact-section {
  padding: var(--section-padding-y) 0;
}

.contact-grid {
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: var(--space-12);
}

@media (max-width: 1024px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
}

/* Info card styling */
.contact-info-card {
  background-color: var(--color-surface-muted);
  border: 1px solid #6B59FF25;
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-xs);
}

.contact-info-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  color: var(--color-brand-primary);
  margin-top: 0;
  margin-bottom: var(--space-8);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.info-item__icon-box {
  width: 40px;
  height: 40px;
  background-color: var(--color-surface);
  border: 1.5px solid var(--color-brand-accent);
  color: var(--color-brand-accent);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon {
  stroke-width: 2.5px;
}

.info-item__content {
  display: flex;
  flex-direction: column;
}

.info-item__label {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-brand-primary);
  margin: 0 0 var(--space-1) 0;
}

.info-item__value {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-normal);
  margin: 0;
}

.info-item__value a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
  font-weight: 600;
}

.info-item__value a:hover {
  color: var(--color-brand-accent);
}

/* Form card styling */
.contact-form {
  background-color: var(--color-surface);
  border: 2px solid #6B59FF25;
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-xs);
}

.contact-form-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  color: var(--color-brand-primary);
  margin-top: 0;
  margin-bottom: var(--space-6);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.form-group {
  margin-bottom: var(--space-4);
  display: flex;
  flex-direction: column;
}

.form-label {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.required {
  color: var(--color-brand-accent);
}

.form-input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-dark);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-brand-accent);
  box-shadow: 0 0 0 3px rgba(198, 146, 46, 0.22);
}

.form-textarea {
  resize: vertical;
}

/* Alert styling */
.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-6);
  font-family: var(--font-body);
  font-size: var(--text-sm);
}

.alert--success {
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-brand-secondary);
  color: var(--color-brand-secondary);
}

.alert--error {
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-brand-accent);
  color: var(--color-brand-accent);
}

.alert-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.alert-text {
  line-height: var(--leading-normal);
}
</style>
