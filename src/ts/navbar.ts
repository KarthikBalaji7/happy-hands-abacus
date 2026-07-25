const navbarToggle = document.querySelector('.navbar__toggle')
const navbarLinks = document.querySelector('.navbar__links')
const navbarCta = document.querySelector('.navbar__cta')

navbarToggle?.addEventListener('click', () => {
  const isOpen = navbarToggle.getAttribute('aria-expanded') === 'true'
  navbarToggle.setAttribute('aria-expanded', String(!isOpen))
  navbarLinks?.classList.toggle('navbar__links--open')
  navbarCta?.classList.toggle('navbar__cta--open')
})
