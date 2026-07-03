import Vue from 'vue'

Vue.directive('uppercase', {
  inserted (el) {
    const input = el.querySelector('input') || el.querySelector('textarea')

    if (input) {
      input.addEventListener('input', () => {
        const start = input.selectionStart
        const end = input.selectionEnd
        const upper = input.value.toUpperCase()

        if (input.value !== upper) {
          input.value = upper
          // notificar correctamente al v-model
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }

        // restaurar posición del cursor
        input.setSelectionRange(start, end)
      })
    }
  }
})
