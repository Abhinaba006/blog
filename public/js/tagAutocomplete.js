let allTags = []

const fetchAndCacheTags = async () => {
  try {
    const response = await fetch('/api/tags')
    const data = await response.json()
    if (response.ok) {
      allTags = data.tags || []
    }
  } catch (error) {
    console.error('Error fetching tags:', error)
  }
}

const initializeTagAutocomplete = (inputSelector) => {
  const input = document.querySelector(inputSelector)
  if (!input) return

  const createDropdown = () => {
    const dropdown = document.createElement('div')
    dropdown.className = 'tag-autocomplete-dropdown'
    dropdown.style.display = 'none'
    input.parentElement.appendChild(dropdown)
    return dropdown
  }

  const dropdown = createDropdown()

  const updateDropdown = () => {
    const currentValue = input.value.trim()
    if (!currentValue) {
      dropdown.style.display = 'none'
      return
    }

    const lastCommaIndex = currentValue.lastIndexOf(',')
    const currentTag = lastCommaIndex === -1 
      ? currentValue 
      : currentValue.substring(lastCommaIndex + 1).trim()

    if (!currentTag) {
      dropdown.style.display = 'none'
      return
    }

    const matches = allTags.filter((tag) =>
      tag.name.toLowerCase().includes(currentTag.toLowerCase())
    )

    if (matches.length === 0) {
      dropdown.style.display = 'none'
      return
    }

    dropdown.innerHTML = matches
      .slice(0, 5)
      .map(
        (tag) => `
      <div class="tag-autocomplete-item" data-tag-name="${tag.name}">
        ${tag.name}
      </div>
    `
      )
      .join('')

    dropdown.style.display = 'block'

    dropdown.querySelectorAll('.tag-autocomplete-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const tagName = e.target.getAttribute('data-tag-name')
        const parts = input.value.split(',')
        parts[parts.length - 1] = ' ' + tagName
        input.value = parts.join(',')
        dropdown.style.display = 'none'
        input.focus()
      })
    })
  }

  input.addEventListener('input', updateDropdown)
  input.addEventListener('blur', () => {
    setTimeout(() => {
      dropdown.style.display = 'none'
    }, 200)
  })
  input.addEventListener('focus', updateDropdown)
}

document.addEventListener('DOMContentLoaded', () => {
  fetchAndCacheTags()
})

window.initializeTagAutocomplete = initializeTagAutocomplete
