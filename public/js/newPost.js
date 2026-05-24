const $titleInput = document.querySelector('#post-title')
const $textInput = document.querySelector('#post-text')
const $publishWrapper = document.querySelector('#publish-wrapper')
const $publishCheckbox = document.querySelector('#publish-checkbox')
const $submitButton = document.querySelector('#post-submit')

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

if ($titleInput && $textInput) {
    $titleInput.addEventListener('input', validatePost)
    $textInput.addEventListener('input', validatePost)
    validatePost()
}
