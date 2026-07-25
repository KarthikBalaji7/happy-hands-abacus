const navbarToggle = document.querySelector('.navbar__toggle')
const navbarMenu = document.querySelector('.navbar__menu')

navbarToggle?.addEventListener('click', () => {
  const isOpen = navbarToggle.getAttribute('aria-expanded') === 'true'
  navbarToggle.setAttribute('aria-expanded', String(!isOpen))
  navbarMenu?.classList.toggle('navbar__menu--open')
})
