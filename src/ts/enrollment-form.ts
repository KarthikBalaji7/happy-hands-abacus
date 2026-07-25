const form = document.getElementById('enrollment-form') as HTMLFormElement | null
const nameInput = document.getElementById('enrollment-name') as HTMLInputElement | null
const phoneInput = document.getElementById('enrollment-phone') as HTMLInputElement | null
const nameError = document.getElementById('enrollment-name-error')
const phoneError = document.getElementById('enrollment-phone-error')
const submitBtn = form?.querySelector('.enrollment__submit') as HTMLButtonElement | null
const intentRadios = form?.querySelectorAll('input[name="intent"]') as NodeListOf<HTMLInputElement> | null

function updateSubmitText() {
  if (!submitBtn || !intentRadios) return
  const checked = form?.querySelector('input[name="intent"]:checked') as HTMLInputElement | null
  submitBtn.textContent = checked?.value === 'demo' ? 'Book Free Demo' : 'Submit Application'
}

intentRadios?.forEach(radio => radio.addEventListener('change', updateSubmitText))

function validateField(input: HTMLInputElement, errorEl: HTMLElement | null) {
  if (!errorEl) return
  if (input.validity.valid || input.value === '') {
    errorEl.textContent = ''
  } else if (input.validity.valueMissing) {
    errorEl.textContent = 'This field is required'
  } else if (input.validity.tooShort) {
    errorEl.textContent = `Must be at least ${input.minLength} characters`
  } else if (input.validity.patternMismatch) {
    errorEl.textContent = input.title
  }
}

nameInput?.addEventListener('blur', () => validateField(nameInput, nameError))
phoneInput?.addEventListener('blur', () => validateField(phoneInput, phoneError))
nameInput?.addEventListener('input', () => validateField(nameInput, nameError))
phoneInput?.addEventListener('input', () => validateField(phoneInput, phoneError))

form?.addEventListener('submit', (e) => {
  e.preventDefault()

  if (!form.checkValidity()) {
    validateField(nameInput!, nameError)
    validateField(phoneInput!, phoneError)
    form.reportValidity()
    return
  }

  const payload = {
    name: nameInput?.value.trim() ?? '',
    phone: phoneInput?.value.trim() ?? '',
    program: (form.querySelector('#enrollment-program') as HTMLSelectElement)?.value ?? '',
    intent: (form.querySelector('input[name="intent"]:checked') as HTMLInputElement)?.value ?? '',
  }

  console.log('Enrollment payload:', payload)
})
