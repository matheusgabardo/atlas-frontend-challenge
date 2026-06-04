<script setup lang="ts">
import { ICONS } from '~/utils/icons'
import { maskPhone } from '~/utils/phone'

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
const successHeading = ref<HTMLElement>()
useFocusTrap(() => props.open, panel, { inertBackground: true })

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
  if (errors.name || errors.email || errors.msg) {
    // Move focus to the first invalid field so screen-reader users hear the error.
    const first = errors.name ? 'quote-name' : errors.email ? 'quote-email' : 'quote-msg'
    nextTick(() => panel.value?.querySelector<HTMLElement>(`#${first}`)?.focus())
    return
  }
  submitting.value = true

  const payload = {
    ...form,
    target: props.single ? props.single.name : `lote: ${props.batchCount} profissionais`,
  }
  // Demo: dados do formulário no console do navegador. MVP sem backend (ver mvp-scope.md).
  console.info('[orçamento] enviando →', payload)
  setTimeout(() => {
    submitting.value = false
    success.value = true
    nextTick(() => successHeading.value?.focus())
  }, 700)
}

function onPhone(e: Event) {
  form.phone = maskPhone((e.target as HTMLInputElement).value)
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
              <label for="quote-name">Nome <span class="req" aria-hidden="true">*</span></label>
              <input
                id="quote-name"
                v-model="form.name"
                autocomplete="name"
                aria-required="true"
                :aria-invalid="errors.name || undefined"
                :aria-describedby="errors.name ? 'quote-name-err' : undefined"
              >
              <div v-if="errors.name" id="quote-name-err" class="field__err" role="alert">Informe seu nome.</div>
            </div>
            <div class="field--row">
              <div class="field" :data-error="errors.email">
                <label for="quote-email">E-mail <span class="req" aria-hidden="true">*</span></label>
                <input
                  id="quote-email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  aria-required="true"
                  :aria-invalid="errors.email || undefined"
                  :aria-describedby="errors.email ? 'quote-email-err' : undefined"
                >
                <div v-if="errors.email" id="quote-email-err" class="field__err" role="alert">E-mail inválido.</div>
              </div>
              <div class="field">
                <label for="quote-phone">WhatsApp</label>
                <input id="quote-phone" :value="form.phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="15" placeholder="(11) 90000-0000" @input="onPhone">
              </div>
            </div>
            <div class="field--row">
              <div class="field"><label for="quote-date">Data do evento</label><input id="quote-date" v-model="form.date" type="date"></div>
              <div class="field"><label for="quote-pax">Público estimado</label><input id="quote-pax" v-model="form.pax" type="number" min="0" placeholder="ex: 150"></div>
            </div>
            <div class="field" :data-error="errors.msg">
              <label for="quote-msg">Detalhes <span class="req" aria-hidden="true">*</span></label>
              <textarea
                id="quote-msg"
                v-model="form.msg"
                aria-required="true"
                :aria-invalid="errors.msg || undefined"
                :aria-describedby="errors.msg ? 'quote-msg-err' : undefined"
                placeholder="Tipo de evento, local, horários, o que você precisa…"
              />
              <div v-if="errors.msg" id="quote-msg-err" class="field__err" role="alert">Conte um pouco sobre o evento.</div>
            </div>
          </form>
        </template>

        <div v-else class="quote-success" role="status" aria-live="polite">
          <div class="quote-success__icon"><AppIcon :d="ICONS.check" /></div>
          <h3 ref="successHeading" tabindex="-1">Pedido enviado!</h3>
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
