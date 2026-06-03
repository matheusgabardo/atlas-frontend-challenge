<script setup lang="ts">
import { ICONS } from '~/utils/icons'

const props = defineProps<{
  open: boolean
  single?: { name: string; sub: string }
  batchCount?: number
}>()
const emit = defineEmits<{ close: [] }>()

const form = reactive({ name: '', email: '', phone: '', date: '', pax: '', msg: '' })
const errors = reactive({ name: false, email: false, msg: false })
const submitting = ref(false)
const success = ref(false)
const panel = ref<HTMLElement>()
useFocusTrap(() => props.open, panel)

const title = computed(() =>
  props.single ? 'Solicitar orçamento' : `Orçamento de ${props.batchCount} profissionais`,
)

function reset() {
  Object.assign(form, { name: '', email: '', phone: '', date: '', pax: '', msg: '' })
  errors.name = errors.email = errors.msg = false
  submitting.value = false
  success.value = false
}

function submit() {
  errors.name = !form.name.trim()
  errors.email = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)
  errors.msg = !form.msg.trim()
  if (errors.name || errors.email || errors.msg) return
  submitting.value = true
  // Mocked submission (no backend in this MVP) — see docs/mvp-scope.md.
  setTimeout(() => {
    submitting.value = false
    success.value = true
  }, 700)
}

function onKeydown(e: KeyboardEvent) {
  if (props.open && e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (open) reset()
    if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
  },
)

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <div
    class="overlay"
    :data-open="open"
    role="dialog"
    aria-modal="true"
    aria-labelledby="quoteTitle"
    @mousedown.self="emit('close')"
  >
    <div ref="panel" class="dialog">
      <div class="dialog__head">
        <div>
          <h2 id="quoteTitle">{{ title }}</h2>
          <p>Resposta normalmente em até 24h. Sem compromisso.</p>
        </div>
        <button class="dialog__close" aria-label="Fechar" @click="emit('close')"><AppIcon :d="ICONS.x" /></button>
      </div>

      <div class="dialog__body">
        <template v-if="!success">
          <div class="quote-ctx">
            <div class="quote-ctx__thumb" />
            <div>
              <div class="quote-ctx__name">{{ single ? single.name : 'Orçamento em lote' }}</div>
              <div class="quote-ctx__sub">{{ single ? single.sub : `${batchCount} profissionais selecionados` }}</div>
            </div>
          </div>

          <form novalidate @submit.prevent="submit">
            <div class="field" :data-error="errors.name">
              <label>Nome <span class="req">*</span></label>
              <input v-model="form.name" autocomplete="name">
              <div class="field__err">Informe seu nome.</div>
            </div>
            <div class="field--row">
              <div class="field" :data-error="errors.email">
                <label>E-mail <span class="req">*</span></label>
                <input v-model="form.email" type="email" autocomplete="email">
                <div class="field__err">E-mail inválido.</div>
              </div>
              <div class="field">
                <label>WhatsApp</label>
                <input v-model="form.phone" type="tel" placeholder="(11) 90000-0000">
              </div>
            </div>
            <div class="field--row">
              <div class="field"><label>Data do evento</label><input v-model="form.date" type="date"></div>
              <div class="field"><label>Público estimado</label><input v-model="form.pax" type="number" placeholder="ex: 150"></div>
            </div>
            <div class="field" :data-error="errors.msg">
              <label>Detalhes <span class="req">*</span></label>
              <textarea v-model="form.msg" placeholder="Tipo de evento, local, horários, o que você precisa…" />
              <div class="field__err">Conte um pouco sobre o evento.</div>
            </div>
          </form>
        </template>

        <div v-else class="quote-success">
          <div class="quote-success__icon"><AppIcon :d="ICONS.check" /></div>
          <h3>Pedido enviado!</h3>
          <p>{{ single ? 'O profissional recebeu' : `Os ${batchCount} profissionais receberam` }} sua solicitação.</p>
          <div class="quote-success__next">
            <b>Próximo passo:</b> você recebe as propostas por e-mail e WhatsApp — normalmente em até 24h.
          </div>
        </div>
      </div>

      <div v-if="!success" class="dialog__foot">
        <button class="btn btn--ghost" @click="emit('close')">Cancelar</button>
        <button class="btn btn--primary btn--block" :disabled="submitting" @click="submit">
          {{ submitting ? 'Enviando…' : 'Enviar pedido' }}
        </button>
      </div>
    </div>
  </div>
</template>
