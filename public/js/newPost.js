const $titleInput = document.querySelector('#post-title')
const $textInput = document.querySelector('#post-text')
const $tagsInput = document.querySelector('#tags')
const $publishWrapper = document.querySelector('#publish-wrapper')
const $publishCheckbox = document.querySelector('#publish-checkbox')
const $submitButton = document.querySelector('#post-submit')
const newPostForm = document.getElementById('new-post-form')

const validatePost = () => {
    const title = $titleInput.value.trim()
    const text = $textInput.value.trim()
    const hasContent = title.length > 0 && text.length > 0

    $submitButton.disabled = !hasContent
    $publishWrapper.style.display = hasContent ? 'block' : 'none'
    if (!hasContent) {
        $publishCheckbox.checked = false
    }
}

const handleNewPostSubmit = async (event) => {
    event.preventDefault()

    const title = $titleInput.value.trim()
    const text = $textInput.value.trim()
    const tags = $tagsInput ? $tagsInput.value.trim().split(',').map((tag) => tag.trim()).filter((tag) => tag) : []
    const published = $publishCheckbox.checked

    if (!title || !text) {
        return
    }

    try {
        const response = await fetch('/api/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, text, tags, published })
        })

        if (response.ok) {
            window.location.href = '/'
        } else {
            const result = await response.json().catch(() => null)
            alert(result?.error || 'Unable to create post.')
        }
    } catch (error) {
        alert('Unable to create post. Please try again.')
    }
}

if ($titleInput && $textInput) {
    $titleInput.addEventListener('input', validatePost)
    $textInput.addEventListener('input', validatePost)
    validatePost()
}

if (newPostForm) {
    newPostForm.addEventListener('submit', handleNewPostSubmit)
}
