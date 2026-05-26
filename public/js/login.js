document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form')
  const signupForm = document.getElementById('signup-form')

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault()
      const email = loginForm.querySelector('#email').value.trim()
      const password = loginForm.querySelector('#password').value.trim()

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        const result = await response.json()
        if (response.ok) {
          window.location.href = '/'
        } else {
          showAuthError(loginForm, result.error || 'Login failed')
        }
      } catch (error) {
        showAuthError(loginForm, 'Unable to login. Please try again.')
      }
    })
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault()
      const name = signupForm.querySelector('#name').value.trim()
      const email = signupForm.querySelector('#email').value.trim()
      const password = signupForm.querySelector('#password').value.trim()

      try {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        })

        const result = await response.json()
        if (response.ok) {
          window.location.href = '/'
        } else {
          showAuthError(signupForm, result.error || 'Signup failed')
        }
      } catch (error) {
        showAuthError(signupForm, 'Unable to create account. Please try again.')
      }
    })
  }
})

function showAuthError(form, message) {
  let alert = form.querySelector('.auth-alert')
  if (!alert) {
    alert = document.getElementsByClassName('auth-alert')[0]
    if (alert) {
        alert.textContent = message
    }else{
        alert = document.createElement('div')
        alert.className = 'auth-alert alert alert-danger'
    }

    alert.className = 'auth-alert alert alert-danger'
    form.parentNode.insertBefore(alert, form)
  }
  alert.textContent = message
}