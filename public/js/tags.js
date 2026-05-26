const tagList = document.querySelector('#tag-list')
const tagForm = document.querySelector('#create-tag-form')
const tagNameInput = document.querySelector('#tag-name')
const tagAlert = document.querySelector('#tag-alert')

const showAlert = (message, type = 'success') => {
  tagAlert.textContent = message
  tagAlert.className = `alert alert-${type}`
  tagAlert.style.display = 'block'
  setTimeout(() => {
    tagAlert.style.display = 'none'
  }, 5000)
}

const fetchTags = async () => {
  try {
    const response = await fetch('/api/tags')
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Unable to load tags')
    }
    renderTags(data.tags)
  } catch (error) {
    showAlert(error.message, 'danger')
  }
}

const renderTags = (tags) => {
  if (!tags || tags.length === 0) {
    tagList.innerHTML = '<div class="list-group-item">No tags yet. Create one to get started.</div>'
    return
  }

  tagList.innerHTML = tags.map((tag) => {
    return `
      <div class="list-group-item" id="tag-${tag._id}">
        <div class="tag-item">
          <strong>${tag.name}</strong>
          <div class="tag-actions">
            <button class="btn btn-xs btn-default" onclick="editTag('${tag._id}', '${tag.name.replace(/'/g, "\\'")}')">Edit</button>
            <button class="btn btn-xs btn-danger" onclick="deleteTag('${tag._id}')">Delete</button>
          </div>
        </div>
      </div>
    `
  }).join('')
}

const createTag = async (name) => {
  try {
    const response = await fetch('/api/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Unable to create tag')
    }
    tagNameInput.value = ''
    showAlert(`Tag '${data.tag.name}' created.`, 'success')
    fetchTags()
  } catch (error) {
    showAlert(error.message, 'danger')
  }
}

const deleteTag = async (id) => {
  if (!confirm('Delete this tag?')) {
    return
  }

  try {
    const response = await fetch(`/api/tags/${id}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Unable to delete tag')
    }
    showAlert('Tag deleted.', 'success')
    fetchTags()
  } catch (error) {
    showAlert(error.message, 'danger')
  }
}

const editTag = async (id, currentName) => {
  const newName = prompt('Update tag name', currentName)
  if (!newName || newName.trim() === '' || newName === currentName) {
    return
  }

  try {
    const response = await fetch(`/api/tags/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName })
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Unable to update tag')
    }
    showAlert(`Tag updated to '${data.tag.name}'.`, 'success')
    fetchTags()
  } catch (error) {
    showAlert(error.message, 'danger')
  }
}

if (tagForm) {
  tagForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const name = tagNameInput.value.trim()
    if (name) {
      createTag(name)
    }
  })
}

window.deleteTag = deleteTag
window.editTag = editTag

fetchTags()
