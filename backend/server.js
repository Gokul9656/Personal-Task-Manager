const express = require('express')
const app = express()
app.use(express.json())
const PORT = 5000
let tasks = []

app.get('/', (req, res) => {
  res.send('Task Manager API is running')
})

app.get('/api/tasks', (req, res) => {
  res.json(tasks)
})

app.post('/api/tasks', (req, res) => {
    const newTask = {
    id: Date.now(),
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate,
    status: 'Pending',
    createdAt: new Date().toISOString()
  }

  tasks.push(newTask)
  res.status(201).json(newTask)
})

app.put('/api/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id)
  const task = tasks.find((task) => task.id === taskId)
  if (!task) {
    return res.status(404).json({ message: 'Task not found' })
  }
  task.title = req.body.title
  task.description = req.body.description
  task.dueDate = req.body.dueDate
  res.json(task)
})

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`)
})