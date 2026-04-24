import { useState } from 'react'
import '../login.css'

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [status, setStatus] = useState('Idle')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (!username.trim() || !password.trim()) {
            setError('Please enter username and password')
            setStatus('Input required')
            return
        }

        setStatus('Authenticating')

        try {
            // API call to authenticate user
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                setError(data.message || 'Invalid username or password')
                setStatus('Failed')
                return
            }

            const data = await response.json()
            // Store token if provided
            if (data.token) {
                localStorage.setItem('authToken', data.token)
            }
            
            setStatus('Success')
            // Redirect to dashboard
            window.location.href = '/dashboard'
        } catch (err) {
            setError('An error occurred. Please try again.')
            setStatus('Error')
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1>Login</h1>
                    <p>Welcome back to Tech Site</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            disabled={status === 'Authenticating'}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                disabled={status === 'Authenticating'}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={togglePasswordVisibility}
                                disabled={status === 'Authenticating'}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <a href="#" className="forgot-password">
                            Forgot Password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={status === 'Authenticating'}
                    >
                        {status === 'Authenticating' ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="signup-link">
                        Don't have an account? <a href="#">Sign up here</a>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login