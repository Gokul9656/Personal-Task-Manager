import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [tasks, setTasks] = useState([])
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [authLoading, setAuthLoading] = useState(false)
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [token, setToken] = useState(sessionStorage.getItem('token'))
  const [authMessage, setAuthMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setTasks([])
      return
    }

    async function fetchUser() {
      try {
        const response = await fetch('http://localhost:5000/api/me',{
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.status === 401 || response.status === 403) {
          handleLogout()
          return
        }
        if (!response.ok) {
          throw new Error(`Failed to fetch user:`)
        }
        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    fetchUser()

    async function fetchTasks() {
      try {
        const response = await fetch('http://localhost:5000/api/tasks', { method: 'GET', headers: { Authorization: `Bearer ${token}` } })
        if (response.status === 401 || response.status === 403) {
          handleLogout()
          return
        }
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks:`)
        }
        const data = await response.json()
        setTasks(data)
      } catch (error) {
        console.error('Error fetching tasks:', error)
      }
    }

    fetchTasks()
  }, [token])

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthLoading(true)
    setAuthMessage('')

    const endpoint = authMode === 'register' ? 'api/register' : 'api/login'
    const requestBody = authMode === 'register' ? { name: authName, email: authEmail, password: authPassword } : { email: authEmail, password: authPassword }
    
    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }
      if (authMode === 'register') {
        setAuthMessage('Registration successful! Please log in.')
        setAuthMode('login')
        setAuthName('')
        setAuthPassword('')
      } else {
        sessionStorage.setItem('token', data.token)
        setToken(data.token)
        setUser(data.user)
        setAuthPassword('')
        setAuthMessage('Login successful!')
      } 
    } catch (error) {
      setAuthMessage(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setTasks([])
    setAuthMessage('')
    setAuthEmail('')
    setAuthPassword('')
    setAuthName('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (editingTaskId !== null) {
      try {
        const currentTask = tasks.find((task) => task.id === editingTaskId)
        const response = await fetch(`http://localhost:5000/api/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: title,
            description: description,
            dueDate: dueDate,
            status: currentTask.status
          })
        })
        if (!response.ok) {
          throw new Error(`Failed to update task:`)
        }
        const updatedTask = await response.json()
        setTasks((previousTasks) =>
          previousTasks.map((task) => (task.id === editingTaskId ? updatedTask : task))
        )
        setEditingTaskId(null)
      } catch (error) {
        console.error('Error updating task:', error)
        return
      }
    } else {
      try {
        const response = await fetch('http://localhost:5000/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ title: title, description: description, dueDate: dueDate })
        })
        if (!response.ok) {
          throw new Error(`Failed to add task:`)
        }
        const newTask = await response.json()
        setTasks((previousTasks) => [...previousTasks, newTask])
      } catch (error) {
        console.error('Error adding task:', error)
        return
      }
    }

    setTitle('')
    setDescription('')
    setDueDate('')
  }

  async function toggleTaskStatus(taskId) {
    try {
      const currentTask = tasks.find((task) => task.id === taskId)
      const updatedStatus = currentTask.status === 'Pending' ? 'Completed' : 'Pending'
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: currentTask.title,
          description: currentTask.description,
          dueDate: currentTask.dueDate,
          status: updatedStatus
        })
      })
      if (!response.ok) {
        throw new Error(`Failed to update task status:`)
      }
      const updatedTask = await response.json()
      setTasks((previousTasks) =>
        previousTasks.map((task) => (task.id === taskId ? updatedTask : task))
      )
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  async function deleteTask(taskId) {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error(`Failed to delete task:`)
      }
      setTasks((previousTasks) => previousTasks.filter((task) => task.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  
  }

  function editTask(task) {
    setTitle(task.title)
    setDescription(task.description)
    setDueDate(task.dueDate)
    setEditingTaskId(task.id)
  }

  function cancelEditing() {
    setTitle('')
    setDescription('')
    setDueDate('')
    setEditingTaskId(null)
  }

  function getDeadlineText(task) {
    if (!task.dueDate) {
      return 'No deadline'
    }

    if (task.status === 'Completed') {
      return 'Completed'
    }

    const today = new Date()
    const dueDate = new Date(task.dueDate)

    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    const dueDateUTC = Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

    const difference = Math.floor((dueDateUTC - todayUTC) / (1000 * 60 * 60 * 24))
    if (difference === 0) {
      return 'Due today'
    }
    if (difference > 0) {
      return `Due in ${difference} days`
    }
    return `Overdue by ${Math.abs(difference)} days`
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length
  const pendingTasks = tasks.filter((task) => task.status === 'Pending').length

  const filteredTasks = tasks
    .filter((task) => {
      const matchesFilter = filter === 'All' || task.status === filter
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) || (task.description || '').toLowerCase().includes(searchTerm.toLowerCase())

      return matchesFilter && matchesSearch
    })
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return 0
    })

  if (!token) {
  return (
    <div className="app">
      <header>
        <h1>Personal Task Manager</h1>
        <p>Organise your tasks and stay productive.</p>
      </header>

      <main>
        <section className="add-task">
          <h2>
            {authMode === 'login' ? 'Login' : 'Create an Account'}
          </h2>

          <form onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={authName}
                  onChange={(event) => setAuthName(event.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={authEmail}
                onChange={(event) => setAuthEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={authLoading}>
              {authLoading
                ? 'Please wait...'
                : authMode === 'login'
                  ? 'Login'
                  : 'Register'}
            </button>
          </form>

          {authMessage && <p>{authMessage}</p>}

          <p>
            {authMode === 'login'
              ? "Don't have an account?"
              : 'Already have an account?'}
          </p>

          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login')
              setAuthMessage('')
            }}
          >
            {authMode === 'login' ? 'Register here' : 'Login here'}
          </button>
        </section>
      </main>
    </div>
  )
}

return (
  <div className="app">
    <header>
      <h1>Personal Task Manager</h1>
      <p>Welcome, {user?.name}!</p>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </header>

    <main>
      <section className="add-task">
        <h2>{editingTaskId ? 'Edit Task' : 'Add a New Task'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              placeholder="Enter your task"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Enter task details (optional)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <button type="submit">{editingTaskId ? 'Update Task' : 'Add Task'}</button>
          {editingTaskId && (
            <button type="button" onClick={cancelEditing}>
              Cancel
            </button>
          )}
        </form>
      </section>

      <section className="task-list">
        <div className="task-stats">
          <div>
            <h3>{totalTasks}</h3>
            <p>Total Tasks</p>
          </div>
          <div>
            <h3>{completedTasks}</h3>
            <p>Completed</p>
          </div>
          <div>
            <h3>{pendingTasks}</h3>
            <p>Pending</p>
          </div>
        </div>
        <h2>My Tasks ({tasks.length})</h2>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="task-filters">
          <button type="button" onClick={() => setFilter('All')}>
            All
          </button>

          <button type="button" onClick={() => setFilter('Pending')}>
            Pending
          </button>

          <button type="button" onClick={() => setFilter('Completed')}>
            Completed
          </button>
        </div>
        {tasks.length === 0 ? (
          <p>No tasks available. Add a new task to get started!</p>
        ) : filteredTasks.length === 0 ? (
          <p>No tasks match your search or filter criteria.</p>
        ) : (
          filteredTasks.map((task) => (
            <div className="task-item" key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
              <p>
                Deadline: {getDeadlineText(task)}
              </p>
              <p>Status: {task.status}</p>

              <button
                type="button"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>

              <button
                type="button"
                onClick={() => editTask(task)}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => toggleTaskStatus(task.id)}
              >
                {task.status === 'Pending' ? 'Mark as Completed' : 'Mark as Pending'}
              </button>


            </div>
          ))
        )}
      </section>
    </main>
  </div>
)
}

export default App