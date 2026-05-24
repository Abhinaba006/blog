function deleteBlog(id) {
    fetch('/blogs/' + id, {
        method: 'delete',
    })
    location.assign('/');
}