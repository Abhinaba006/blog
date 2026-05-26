document.addEventListener('DOMContentLoaded', () => {
  const editForm = document.getElementById('edit-post-form')
  if (!editForm) {
    return
  }

  editForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const blogId = editForm.dataset.blogId
    const title = editForm.querySelector('#title').value.trim()
    const text = editForm.querySelector('#text').value.trim()
    const tagsInput = editForm.querySelector('#tags')
    const published = editForm.querySelector('#flexCheckDefault').checked

    if (!title || !text) {
      return
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, text, published, tags: tagsInput ? tagsInput.value.trim().split(',').map((tag) => tag.trim()).filter((tag) => tag) : [] })
      })

      if (response.ok) {
        window.location.href = `/blogs/${blogId}`
      } else {
        const result = await response.json().catch(() => null)
        alert(result?.error || 'Unable to update post.')
      }
    } catch (error) {
      alert('Unable to update post. Please try again.')
    }
  })
})