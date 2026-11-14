const express = require('express')
const db = require('./db')
const app = express()
app.use(express.json())
const PORT = 5000
let tasks = []

app.get('/', (req, res) => {
  res.send('Task Manager API is running')
})

app.get('/api/tasks', (req, res) => {
  const sql = 'SELECT id, title, description, DATE_FORMAT(due_date, "%Y-%m-%d") AS dueDate, status, created_at AS createdAt FROM tasks'
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message })
    }
    res.json(results)
  })
})

app.post('/api/tasks', (req, res) => {
  const { title, description, dueDate } = req.body
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' })
  }
  const sql = 'INSERT INTO tasks (title, description, due_date) VALUES (?, ?, ?)'
  const values = [title.trim(), description || null, dueDate || null]
  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message })
    }
  const selectSql = 'SELECT id, title, description, DATE_FORMAT(due_date, "%Y-%m-%d") AS dueDate, status, created_at AS createdAt FROM tasks WHERE id = ?'
  db.query(selectSql, [result.insertId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message })
    }
    res.status(201).json(rows[0])
  })
})
})

app.put('/api/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id)
  const { title, description, dueDate, status } = req.body
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' })
  }
  const sql = 'UPDATE tasks SET title = ?, description = ?, due_date = ?, status = ? WHERE id = ?'
  const values = [title.trim(), description || null, dueDate || null, status, taskId]
  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message })
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' })
    }
    const selectSql = 'SELECT id, title, description, DATE_FORMAT(due_date, "%Y-%m-%d") AS dueDate, status, created_at AS createdAt FROM tasks WHERE id = ?'
    db.query(selectSql, [taskId], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: err.message })
      }
      res.json(rows[0])
    })
  })
})

app.delete('/api/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id)
  const sql = 'DELETE FROM tasks WHERE id = ?'
  db.query(sql, [taskId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message })
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json({ message: 'Task deleted successfully' })
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`)
})