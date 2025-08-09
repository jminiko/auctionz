<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="not-found-icon">🔍</div>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      
      <div class="not-found-actions">
        <router-link to="/" class="btn btn-primary">
          Go Home
        </router-link>
        <router-link to="/auctions" class="btn btn-outline">
          Browse Auctions
        </router-link>
      </div>
      
      <div class="not-found-help">
        <h3>Looking for something specific?</h3>
        <div class="help-links">
          <router-link to="/auctions" class="help-link">Browse Auctions</router-link>
          <router-link to="/login" class="help-link">Sign In</router-link>
          <router-link to="/register" class="help-link">Create Account</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional logic needed for this simple 404 page
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, var(--color-background-soft) 0%, var(--color-background) 100%);
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.not-found-icon {
  font-size: 6rem;
  margin-bottom: 2rem;
  opacity: 0.7;
}

.not-found h1 {
  font-size: 3rem;
  font-weight: bold;
  color: var(--color-heading);
  margin-bottom: 1rem;
}

.not-found p {
  font-size: 1.125rem;
  color: var(--color-text);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.not-found-help {
  border-top: 1px solid var(--color-border);
  padding-top: 2rem;
}

.not-found-help h3 {
  color: var(--color-heading);
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.help-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.help-link {
  color: var(--color-heading);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
}

.help-link:hover {
  color: #1a202c;
  background: var(--color-background-soft);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  text-decoration: none;
  border: 1px solid transparent;
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

.btn-primary:hover {
  background: #1a202c;
}

.btn-outline {
  border-color: var(--color-border);
  color: var(--color-text);
  background: transparent;
}

.btn-outline:hover {
  background: var(--color-background-soft);
}

@media (max-width: 640px) {
  .not-found h1 {
    font-size: 2.5rem;
  }
  
  .not-found-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .help-links {
    flex-direction: column;
    align-items: center;
  }
}
</style>
