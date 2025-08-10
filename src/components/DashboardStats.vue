<template>
  <div class="stats-grid">
    <div
      v-for="stat in stats"
      :key="stat.key"
      class="stat-card"
      :class="{ clickable: stat.clickable }"
      @click="stat.clickable ? $emit('stat-click', stat.key) : null"
    >
      <div class="stat-icon">{{ stat.icon }}</div>
      <div class="stat-content">
        <div class="stat-number">{{ formatValue(stat.value, stat.format) }}</div>
        <div class="stat-label">{{ stat.label }}</div>
        <div
          v-if="stat.change !== undefined"
          class="stat-change"
          :class="getChangeClass(stat.change)"
        >
          {{ formatChange(stat.change) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface StatItem {
  key: string
  label: string
  value: number
  icon: string
  format?: 'number' | 'currency' | 'percentage' | 'decimal'
  change?: number
  clickable?: boolean
}

interface Props {
  stats: StatItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'stat-click': [key: string]
}>()

const formatValue = (value: number, format?: string) => {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString()}`
    case 'percentage':
      return `${value}%`
    case 'decimal':
      return value.toFixed(1)
    default:
      return value.toLocaleString()
  }
}

const formatChange = (change: number) => {
  if (change === 0) return 'No change'
  const sign = change > 0 ? '+' : ''
  return `${sign}${change}%`
}

const getChangeClass = (change: number) => {
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  border-color: var(--color-heading);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-soft);
  border-radius: 1rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.875rem;
  font-weight: bold;
  color: var(--color-heading);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--color-text);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #166534;
}

.stat-change.negative {
  color: #dc2626;
}

.stat-change.neutral {
  color: var(--color-text);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
