function deleteBlog(id) {
    fetch('/blogs/' + id, {
        method: 'delete',
    })
    .then(() => {
        location.assign('/user/me');
    })
    .catch((error) => {
        console.error('Error deleting blog:', error)
    })
}