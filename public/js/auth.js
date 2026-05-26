document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logout-button')
  if (!logoutButton) {
    return
  }

  logoutButton.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        window.location.href = '/'
      } else {
        const result = await response.json().catch(() => null)
        console.error('Logout failed', result)
      }
    } catch (error) {
      console.error('Error logging out', error)
    }
  })
})