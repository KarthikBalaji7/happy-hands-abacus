document.querySelectorAll('.programs__item-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.closest('.programs__item')
    const isOpen = item?.classList.contains('programs__item--open')
    header.setAttribute('aria-expanded', String(!isOpen))
    item?.classList.toggle('programs__item--open')
  })
})
