<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error?.statusCode === 404)

useHead({ title: () => (is404.value ? 'Página não encontrada — QuemFaz Eventos' : 'Erro — QuemFaz Eventos') })

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="errpage">
    <header class="header">
      <NuxtLink class="brand" to="/" aria-label="QuemFaz Eventos — início">
        <span class="brand__mark"><img src="/logo-symbol.png" alt="" width="36" height="36"></span>
        <span class="brand__name"><span class="word">quem<span class="faz">faz</span></span><small>Eventos</small></span>
      </NuxtLink>
    </header>

    <main class="errpage__main">
      <div class="errpage__code">{{ error?.statusCode || 500 }}</div>
      <h1>{{ is404 ? 'Página não encontrada' : 'Algo deu errado' }}</h1>
      <p>
        {{
          is404
            ? 'O link pode estar quebrado ou o profissional saiu do catálogo. Que tal voltar e buscar de novo?'
            : 'Tivemos um problema inesperado. Tente novamente em instantes.'
        }}
      </p>
      <button class="btn btn--primary" @click="goHome">Voltar à busca</button>
    </main>
  </div>
</template>

<style scoped>
.errpage {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text);
}
.errpage__main {
  flex: 1;
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
  gap: var(--sp-3);
  padding: var(--sp-8);
}
.errpage__code {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(4.5rem, 20vw, 10rem);
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--primary);
}
.errpage__main h1 {
  font-size: var(--fs-xl);
}
.errpage__main p {
  color: var(--text-2);
  max-width: 44ch;
}
.errpage__main .btn {
  margin-top: var(--sp-3);
}
</style>
