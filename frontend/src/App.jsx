import { useState } from 'react'
import './App.css'

function App() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [tasks, setTasks] = useState([])
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (editingTaskId !== null) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === editingTaskId) {
          return {
            ...task,
            title: title,
            description: description,
            dueDate: dueDate
          }
        }

        return task
      })

      setTasks(updatedTasks)
      setEditingTaskId(null)
    } else {
      const newTask = {
        id: Date.now(),
        title: title,
        description: description,
        dueDate: dueDate,
        status: 'Pending',
        createdAt: new Date().toISOString()
      }

      setTasks([...tasks, newTask])
    }

    setTitle('')
    setDescription('')
    setDueDate('')
  }

  function toggleTaskStatus(taskId) {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          status: task.status === 'Pending' ? 'Completed' : 'Pending'
        }
      }

      return task
    })



    setTasks(updatedTasks)
  }

  function deleteTask(taskId) {
    const updatedTasks = tasks.filter((task) => task.id !== taskId)

    setTasks(updatedTasks)
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
    Date(task.dueDate)

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


return (
  <div className="app">
    <header>
      <h1>Personal Task Manager</h1>
      <p>Organise your tasks and stay productive.</p>
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