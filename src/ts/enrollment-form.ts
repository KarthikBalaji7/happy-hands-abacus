const form = document.getElementById('enrollment-form') as HTMLFormElement | null
const nameInput = document.getElementById('enrollment-name') as HTMLInputElement | null
const phoneInput = document.getElementById('enrollment-phone') as HTMLInputElement | null
const emailInput = document.getElementById('enrollment-email') as HTMLInputElement | null
const programSelect = document.getElementById('enrollment-program') as HTMLSelectElement | null
const nameError = document.getElementById('enrollment-name-error')
const phoneError = document.getElementById('enrollment-phone-error')
const emailError = document.getElementById('enrollment-email-error')
const statusBox = document.getElementById('enrollment-status') as HTMLDivElement | null
const submitBtn = form?.querySelector('.enrollment__submit') as HTMLButtonElement | null
const submitBtnText = submitBtn?.querySelector('.enrollment__submit-text') as HTMLSpanElement | null
const intentRadios = form?.querySelectorAll('input[name="intent"]') as NodeListOf<HTMLInputElement> | null

function getSubmitDefaultText(): string {
  const checked = form?.querySelector('input[name="intent"]:checked') as HTMLInputElement | null
  return checked?.value === 'demo' ? 'Enquire' : 'Submit Application'
}

function updateSubmitText() {
  if (!submitBtn) return
  const text = getSubmitDefaultText()
  if (submitBtnText) {
    submitBtnText.textContent = text
  } else {
    submitBtn.textContent = text
  }
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
  } else if (input.validity.patternMismatch || input.validity.typeMismatch) {
    errorEl.textContent = input.title || 'Please enter a valid email address'
  }
}

nameInput?.addEventListener('blur', () => validateField(nameInput, nameError))
phoneInput?.addEventListener('blur', () => validateField(phoneInput, phoneError))
emailInput?.addEventListener('blur', () => emailInput && validateField(emailInput, emailError))
nameInput?.addEventListener('input', () => validateField(nameInput, nameError))
phoneInput?.addEventListener('input', () => validateField(phoneInput, phoneError))
emailInput?.addEventListener('input', () => emailInput && validateField(emailInput, emailError))

function setStatusMessage(type: 'success' | 'error' | null, message: string = '') {
  if (!statusBox) return
  statusBox.className = 'enrollment__status'
  if (!type || !message) {
    statusBox.innerHTML = ''
    return
  }

  const iconClass = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'
  statusBox.classList.add(`enrollment__status--${type}`)
  statusBox.innerHTML = `<i class="${iconClass}" style="margin-top: 3px;"></i><span>${message}</span>`
}

function setSubmittingState(isSubmitting: boolean) {
  if (!submitBtn) return
  submitBtn.disabled = isSubmitting
  const defaultText = getSubmitDefaultText()
  const targetLabel = submitBtnText || submitBtn

  if (isSubmitting) {
    targetLabel.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...'
  } else {
    targetLabel.textContent = defaultText
  }
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault()
  setStatusMessage(null)

  if (!form.checkValidity()) {
    validateField(nameInput!, nameError)
    validateField(phoneInput!, phoneError)
    if (emailInput) validateField(emailInput, emailError)
    form.reportValidity()
    return
  }

  const payload = {
    name: nameInput?.value.trim() ?? '',
    phone: phoneInput?.value.trim() ?? '',
    email: emailInput?.value.trim() ?? '',
    program: programSelect?.value ?? '',
    intent: (form.querySelector('input[name="intent"]:checked') as HTMLInputElement)?.value ?? 'enroll',
  }

  setSubmittingState(true)

  try {
    const response = await fetch('/.netlify/functions/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok || (data && data.success === false)) {
      const errorMsg = data?.error || 'Something went wrong while submitting. Please try again later or reach out via phone.'
      setStatusMessage('error', errorMsg)
      return
    }

    // Success
    const successMsg = data?.message || 'Thank you! Your request has been received. We will get back to you shortly.'
    setStatusMessage('success', successMsg)

    // Reset the form
    form.reset()
    if (programSelect) {
      programSelect.dispatchEvent(new Event('change'))
    }
    updateSubmitText()
  } catch (err) {
    console.error('Submission error:', err)
    setStatusMessage(
      'error',
      'Unable to connect to the server. Please check your internet connection or reach out to us directly.'
    )
  } finally {
    setSubmittingState(false)
  }
})
