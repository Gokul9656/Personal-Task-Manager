const express = require('express')
const db = require('./db')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(express.json())
const PORT = 5000
let tasks = []

app.get('/', (req, res) => {
  res.send('Task Manager API is running')
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired access token' })
  }
}

app.get('/api/tasks', authenticateToken, (req, res) => {
  const sql = 'SELECT id, title, description, DATE_FORMAT(due_date, "%Y-%m-%d") AS dueDate, status, created_at AS createdAt FROM tasks WHERE user_id = ?'
  db.query(sql, [req.user.id], (err, results) => {
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

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password)
  return res.status(400).json({ message: 'Name, email, and password are required' })

if (password.length < 8) {
  return res.status(400).json({ message: 'Password must be at least 8 characters long' })
}
try {
  const hashedPassword = await bcrypt.hash(password, 10)
  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
  const values = [name.trim(), email.trim().toLowerCase(), hashedPassword]

  db.query(sql, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Email already exists' })
      }
      console.error(err)
      return res.status(500).json({ message: 'Internal server error' })
    }
    res.status(201).json({message: 'User registered successfully', user: { id: result.insertId, name: name.trim(), email: email.trim().toLowerCase() } })
  })
} catch (err) {
  console.error('Error registering user:', err)
  res.status(500).json({ message: 'Internal server error' })
}
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }
  try {
    const sql = 'SELECT * FROM users WHERE email = ?'
    db.query(sql, [email.trim().toLowerCase()], async (err, results) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ message: 'Internal server error' })
      }
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' })
      }
      const user = results[0]
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' })
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
      res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } })
    })
  } catch (err) {
    console.error('Error logging in:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`)
})