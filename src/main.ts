import './style.css'
import './topbar.css'
import './navbar.css'
import './hero.css'
import './features.css'
import './about.css'
import './programs.css'
import './enrollment.css'
import './contact.css'
import './footer.css'

import {
  createIcons,
  Phone,
  Mail,
  Play,
  Eye,
  Calculator,
  Brain,
  Sparkles,
  ArrowRight,
  Users,
  User,
  ClipboardCheck,
  Gamepad2,
  Target,
  Lightbulb,
  Baby,
  GraduationCap,
  Trophy,
  ChevronDown,
  Heart,
  Menu,
  X,
  MapPin,
} from 'lucide'

createIcons({
  icons: {
    Phone,
    Mail,
    Play,
    Eye,
    Calculator,
    Brain,
    Sparkles,
    ArrowRight,
    Users,
    User,
    ClipboardCheck,
    Gamepad2,
    Target,
    Lightbulb,
    Baby,
    GraduationCap,
    Trophy,
    ChevronDown,
    Heart,
    Menu,
    X,
    MapPin,
  },
})

document.querySelectorAll('.programs__item-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.closest('.programs__item')
    const isOpen = item?.classList.contains('programs__item--open')
    header.setAttribute('aria-expanded', String(!isOpen))
    item?.classList.toggle('programs__item--open')
  })
})

const navbarToggle = document.querySelector('.navbar__toggle')
const navbarLinks = document.querySelector('.navbar__links')
const navbarCta = document.querySelector('.navbar__cta')

navbarToggle?.addEventListener('click', () => {
  const isOpen = navbarToggle.getAttribute('aria-expanded') === 'true'
  navbarToggle.setAttribute('aria-expanded', String(!isOpen))
  navbarLinks?.classList.toggle('navbar__links--open')
  navbarCta?.classList.toggle('navbar__cta--open')
})

const iconMap: Record<string, string> = {
  'heart': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  'baby': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>',
  'graduation-cap': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>',
  'brain': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>',
  'trophy': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
}

const enrollmentSelect = document.getElementById('enrollment-program') as HTMLSelectElement | null
const enrollmentIcon = document.getElementById('enrollment-select-icon')

function updateSelectIcon() {
  if (!enrollmentSelect || !enrollmentIcon) return
  const selected = enrollmentSelect.options[enrollmentSelect.selectedIndex]
  const iconName = selected?.getAttribute('data-icon')
  if (iconName && iconMap[iconName]) {
    enrollmentIcon.innerHTML = iconMap[iconName]
    enrollmentIcon.style.display = 'flex'
  } else {
    enrollmentIcon.innerHTML = ''
    enrollmentIcon.style.display = 'none'
  }
}

updateSelectIcon()
enrollmentSelect?.addEventListener('change', updateSelectIcon)

const enrollmentForm = document.getElementById('enrollment-form') as HTMLFormElement | null
const nameInput = document.getElementById('enrollment-name') as HTMLInputElement | null
const phoneInput = document.getElementById('enrollment-phone') as HTMLInputElement | null
const nameError = document.getElementById('enrollment-name-error')
const phoneError = document.getElementById('enrollment-phone-error')

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

enrollmentForm?.addEventListener('submit', (e) => {
  const isValid = enrollmentForm.checkValidity()
  if (!isValid) {
    e.preventDefault()
    validateField(nameInput!, nameError)
    validateField(phoneInput!, phoneError)
    enrollmentForm.reportValidity()
  }
})

document.querySelectorAll('.programs__item-cta[data-program]').forEach(link => {
  link.addEventListener('click', () => {
    const program = (link as HTMLElement).dataset.program
    if (program && enrollmentSelect) {
      enrollmentSelect.value = program
      updateSelectIcon()
    }
  })
})
