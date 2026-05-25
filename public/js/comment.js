document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.querySelector('.comment-form')
    const commentsRoot = document.querySelector('.page-card')

    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit)
    }

    if (commentsRoot) {
        commentsRoot.addEventListener('click', handleCommentAction)
    }
})

async function handleCommentSubmit(e) {
    e.preventDefault()

    const commentForm = e.currentTarget
    const textInput = commentForm.querySelector('input[name="text"]')
    const postIDInput = commentForm.querySelector('input[name="postID"]')

    const text = textInput.value.trim()
    const postID = postIDInput.value

    if (!text) {
        alert('Please enter a comment before submitting.')
        return
    }

    try {
        const response = await fetch(`/blogs/comment/${postID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                postID
            })
        })

        if (response.ok) {
            window.location.reload()
        } else {
            alert('Failed to post comment. Please try again.')
        }
    } catch (error) {
        console.error('Error posting comment:', error)
        alert('An error occurred while posting your comment.')
    }
}

function handleCommentAction(e) {
    const deleteButton = e.target.closest('.comment-delete')
    if (deleteButton) {
        const commentId = deleteButton.dataset.commentId
        deleteComment(commentId)
        return
    }

    const editButton = e.target.closest('.comment-edit')
    if (editButton) {
        const commentCard = editButton.closest('.message-card')
        if (commentCard) {
            startCommentEdit(commentCard)
        }
        return
    }

    const saveButton = e.target.closest('.comment-save')
    if (saveButton) {
        const commentCard = saveButton.closest('.message-card')
        const input = commentCard?.querySelector('.comment-edit-input')
        const commentId = commentCard?.dataset.commentId
        if (commentCard && input && commentId) {
            saveCommentEdit(commentId, input.value.trim(), commentCard)
        }
        return
    }

    const cancelButton = e.target.closest('.comment-cancel')
    if (cancelButton) {
        const commentCard = cancelButton.closest('.message-card')
        if (commentCard) {
            cancelCommentEdit(commentCard)
        }
    }
}

async function deleteComment(commentId) {
    if (!commentId) {
        return
    }

    if (!confirm('Delete this comment?')) {
        return
    }

    try {
        const response = await fetch(`/blogs/comment/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (response.ok) {
            window.location.reload()
        } else {
            const data = await response.json().catch(() => null)
            const message = data?.error || 'Unable to delete comment.'
            alert(message)
        }
    } catch (error) {
        console.error('Error deleting comment:', error)
        alert('An error occurred while deleting the comment.')
    }
}

function startCommentEdit(commentCard) {
    if (commentCard.querySelector('.comment-edit-input')) {
        return
    }

    const textElement = commentCard.querySelector('.comment-text')
    const originalText = textElement ? textElement.textContent.trim() : ''
    commentCard.dataset.originalText = originalText

    if (textElement) {
        textElement.textContent = ''
        const input = document.createElement('input')
        input.type = 'text'
        input.className = 'form-control comment-edit-input'
        input.value = originalText
        textElement.appendChild(input)
        input.focus()
    }

    const controls = document.createElement('div')
    controls.className = 'comment-edit-controls'
    controls.innerHTML = `
        <button type="button" class="btn btn-primary comment-save">Save</button>
        <button type="button" class="btn btn-secondary comment-cancel">Cancel</button>
    `
    commentCard.querySelector('.card-actions')?.appendChild(controls)
}

async function saveCommentEdit(commentId, newText, commentCard) {
    if (!newText) {
        alert('Comment text cannot be empty.')
        return
    }

    try {
        const response = await fetch(`/blogs/comment/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: newText })
        })

        if (response.ok) {
            window.location.reload()
        } else {
            const data = await response.json().catch(() => null)
            const message = data?.error || 'Failed to update comment.'
            alert(message)
        }
    } catch (error) {
        console.error('Error updating comment:', error)
        alert('An error occurred while updating the comment.')
    }
}

function cancelCommentEdit(commentCard) {
    const originalText = commentCard.dataset.originalText || ''
    const textElement = commentCard.querySelector('.comment-text')
    if (textElement) {
        textElement.textContent = originalText
    }
    const controls = commentCard.querySelector('.comment-edit-controls')
    controls?.remove()
}
