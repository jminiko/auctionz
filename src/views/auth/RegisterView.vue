<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>Create Account</h1>
        <p>Join AuctionZ and start bidding or selling today</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              :disabled="authStore.loading"
              class="form-input"
              :class="{ 'error': errors.firstName }"
              placeholder="Enter your first name"
            />
            <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              :disabled="authStore.loading"
              class="form-input"
              :class="{ 'error': errors.lastName }"
              placeholder="Enter your last name"
            />
            <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            :disabled="authStore.loading"
            class="form-input"
            :class="{ 'error': errors.email }"
            placeholder="Enter your email"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="phone">Phone Number (Optional)</label>
          <input
            id="phone"
            v-model="form.phone"
            type="tel"
            :disabled="authStore.loading"
            class="form-input"
            :class="{ 'error': errors.phone }"
            placeholder="Enter your phone number"
          />
          <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>

        <div class="form-group">
          <label for="role">Account Type</label>
          <div class="role-options">
            <label class="role-option">
              <input
                type="radio"
                v-model="form.role"
                value="buyer"
                :disabled="authStore.loading"
              />
              <div class="role-content">
                <div class="role-icon">🛒</div>
                <div class="role-info">
                  <div class="role-title">Buyer</div>
                  <div class="role-description">Bid on auctions and purchase items</div>
                </div>
              </div>
            </label>

            <label class="role-option">
              <input
                type="radio"
                v-model="form.role"
                value="seller"
                :disabled="authStore.loading"
              />
              <div class="role-content">
                <div class="role-icon">🏪</div>
                <div class="role-info">
                  <div class="role-title">Seller</div>
                  <div class="role-description">Create auctions and sell items</div>
                </div>
              </div>
            </label>
          </div>
          <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              :disabled="authStore.loading"
              class="form-input"
              :class="{ 'error': errors.password }"
              placeholder="Create a password"
            />
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              :disabled="authStore.loading"
              class="form-input"
              :class="{ 'error': errors.confirmPassword }"
              placeholder="Confirm your password"
            />
            <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="agreeToTerms"
              :disabled="authStore.loading"
            />
            <span>
              I agree to the
              <a href="#" class="link">Terms of Service</a>
              and
              <a href="#" class="link">Privacy Policy</a>
            </span>
          </label>
          <span v-if="errors.terms" class="error-message">{{ errors.terms }}</span>
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="btn btn-primary btn-full"
        >
          <span v-if="authStore.loading" class="loading-spinner"></span>
          {{ authStore.loading ? 'Creating account...' : 'Create Account' }}
        </button>

        <div v-if="authStore.error" class="error-alert">
          {{ authStore.error }}
        </div>
      </form>

      <div class="register-footer">
        <p>
          Already have an account?
          <router-link to="/login" class="link">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'buyer' as 'buyer' | 'seller',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  confirmPassword: '',
  terms: ''
})

const agreeToTerms = ref(false)

const validateForm = () => {
  errors.firstName = ''
  errors.lastName = ''
  errors.email = ''
  errors.phone = ''
  errors.role = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.terms = ''

  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required'
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'Last name is required'
  }

  if (!form.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email'
  }

  if (form.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(form.phone.replace(/\s/g, ''))) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (!form.role) {
    errors.role = 'Please select an account type'
  }

  if (!form.password) {
    errors.password = 'Password is required'
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  if (!agreeToTerms.value) {
    errors.terms = 'You must agree to the terms and conditions'
  }

  return !Object.values(errors).some(error => error)
}

const handleRegister = async () => {
  if (!validateForm()) return

  try {
    await authStore.register({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      role: form.role,
      phone: form.phone || undefined
    })

    // Redirect to appropriate dashboard
    if (authStore.isAdmin) {
      router.push('/admin-dashboard')
    } else if (authStore.isSeller) {
      router.push('/seller-dashboard')
    } else if (authStore.isBuyer) {
      router.push('/buyer-dashboard')
    } else {
      router.push('/dashboard')
    }
  } catch (error) {
    // Error is handled by the store
    console.error('Registration failed:', error)
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, var(--color-background-soft) 0%, var(--color-background) 100%);
}

.register-card {
  background: var(--color-background);
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
  border: 1px solid var(--color-border);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  color: var(--color-heading);
  font-size: 1.875rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.register-header p {
  color: var(--color-text);
  font-size: 1rem;
}

.register-form {
  margin-bottom: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-heading);
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: var(--color-background);
  color: var(--color-text);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-heading);
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
}

.form-input.error {
  border-color: #dc2626;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.role-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
}

.role-option {
  cursor: pointer;
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
  background: var(--color-background);
}

.role-option:hover {
  border-color: var(--color-heading);
  background: var(--color-background-soft);
}

.role-option input[type="radio"] {
  display: none;
}

.role-option input[type="radio"]:checked + .role-content {
  color: var(--color-heading);
}

.role-option input[type="radio"]:checked ~ .role-content {
  color: var(--color-heading);
}

.role-option:has(input[type="radio"]:checked) {
  border-color: var(--color-heading);
  background: var(--color-background-soft);
}

.role-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.role-icon {
  font-size: 2rem;
}

.role-info {
  flex: 1;
}

.role-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.role-description {
  font-size: 0.875rem;
  color: var(--color-text);
  line-height: 1.4;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text);
  line-height: 1.5;
}

.checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
  margin-top: 0.125rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--color-heading);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1a202c;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-full {
  width: 100%;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-alert {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.register-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.register-footer p {
  color: var(--color-text);
  margin: 0;
}

.link {
  color: var(--color-heading);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.link:hover {
  color: #1a202c;
}

@media (max-width: 640px) {
  .register-card {
    padding: 2rem 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .role-options {
    grid-template-columns: 1fr;
  }
}
</style>
