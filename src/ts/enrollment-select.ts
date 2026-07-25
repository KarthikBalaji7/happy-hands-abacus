const iconMap: Record<string, string> = {
  'person-pregnant': '<i class="fa-solid fa-person-pregnant"></i>',
  'baby': '<i class="fa-solid fa-child-reaching"></i>',
  'graduation-cap': '<i class="fa-solid fa-graduation-cap"></i>',
  'brain': '<i class="fa-solid fa-brain"></i>',
  'trophy': '<i class="fa-solid fa-trophy"></i>',
}

const select = document.getElementById('enrollment-program') as HTMLSelectElement | null
const icon = document.getElementById('enrollment-select-icon')

function updateSelectIcon() {
  if (!select || !icon) return
  const selected = select.options[select.selectedIndex]
  const iconName = selected?.getAttribute('data-icon')
  if (iconName && iconMap[iconName]) {
    icon.innerHTML = iconMap[iconName]
    icon.style.display = 'flex'
  } else {
    icon.innerHTML = ''
    icon.style.display = 'none'
  }
}

updateSelectIcon()
select?.addEventListener('change', updateSelectIcon)

document.querySelectorAll('.programs__item-cta[data-program]').forEach(link => {
  link.addEventListener('click', () => {
    const program = (link as HTMLElement).dataset.program
    if (program && select) {
      select.value = program
      updateSelectIcon()
    }
  })
})
