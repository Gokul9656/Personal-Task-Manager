import { useState } from 'react'
import './App.css'

function App() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [tasks, setTasks] = useState([])
  const [editingTaskId, setEditingTaskId] = useState(null)

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
      status: 'Pending'
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

  return (
    <div className="app">
      <header>
        <h1>Personal Task Manager</h1>
        <p>Organise your tasks and stay productive.</p>
      </header>

      <main>
        <section className="add-task">
          <h2>Add a New Task</h2>

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

            <button type="submit">Add Task</button>
          </form>
        </section>

        <section className="task-list">
          <h2>My Tasks ({tasks.length})</h2>

          {tasks.length === 0 ? (
            <p>No tasks added yet.</p>
          ) : (
            tasks.map((task) => (
              <div className="task-item" key={task.id}>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>
                  Due Date: {task.dueDate || 'No deadline'}
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