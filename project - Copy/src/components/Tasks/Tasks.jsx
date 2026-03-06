import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, CheckCircle2, Circle, Trash2, Edit2 } from 'lucide-react'
import axios from 'axios'
import './Tasks.css'

const Tasks = () => {
  // Load tasks from localStorage on mount and sync with it
  const [tasks, setTasks] = useState([])
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', dueDate: '' })
  const [filter, setFilter] = useState('all')

  const fetchTasks = async () => {
    try {
      const response = await axios.get('https://taskpilot-backend-n09v.onrender.com/api/tasks')
      setTasks(response.data.data.map(task => ({
        ...task,
        completed: task.status === 'COMPLETED'
      })))
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  // Load tasks from backend on mount
  useEffect(() => {
    fetchTasks()
  }, [])

  // Listen for new tasks created by Assistant
  useEffect(() => {
    const handleTaskCreated = () => fetchTasks()

    window.addEventListener('taskCreated', handleTaskCreated)

    return () => {
      window.removeEventListener('taskCreated', handleTaskCreated)
    }
  }, [])

  const toggleTask = async (id) => {
    const taskToToggle = tasks.find(t => t.id === id)
    if (!taskToToggle) return

    const newStatus = taskToToggle.completed ? 'PENDING' : 'COMPLETED'

    // Optimistic UI update
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed, status: newStatus } : task
    ))

    try {
      await axios.put(`https://taskpilot-backend-n09v.onrender.com/api/tasks/${id}/status`, { status: newStatus })
    } catch (error) {
      console.error('Failed to update task status:', error)
      // Revert optimistic update
      fetchTasks()
    }
  }

  const addTask = async () => {
    if (newTask.title.trim()) {
      try {
        const response = await axios.post('https://taskpilot-backend-n09v.onrender.com/api/tasks', {
          ...newTask,
          status: 'PENDING'
        })
        const createdTask = { ...response.data.data, completed: false }
        setTasks([...tasks, createdTask])
        setNewTask({ title: '', priority: 'medium', dueDate: '' })
        setShowAddTask(false)
      } catch (error) {
        if (error.response?.status === 403 && error.response?.data?.upgradeRequired) {
          alert('You have reached your free daily limit for tasks. Please upgrade to Premium to create more tasks.')
        } else {
          console.error('Failed to create task:', error)
          alert('Failed to create task. Please try again.')
        }
      }
    }
  }

  const deleteTask = async (id) => {
    // Optimistic UI update
    const previousTasks = [...tasks]
    setTasks(tasks.filter(task => task.id !== id))

    try {
      await axios.delete(`https://taskpilot-backend-n09v.onrender.com/api/tasks/${id}`)
    } catch (error) {
      console.error('Failed to delete task:', error)
      // Revert optimistic update
      setTasks(previousTasks)
    }
  }

  const filteredTasks = filter === 'all'
    ? tasks
    : filter === 'completed'
      ? tasks.filter(t => t.completed)
      : tasks.filter(t => !t.completed)

  return (
    <div className="content-area">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage your daily tasks and stay organized</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddTask(!showAddTask)}>
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {showAddTask && (
        <div className="add-task-card card">
          <h3>Create New Task</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="input"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setShowAddTask(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={addTask}>
              Add Task
            </button>
          </div>
        </div>
      )}

      <div className="tasks-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search tasks..." className="search-input" />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="tasks-list">
        {filteredTasks.map(task => (
          <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <button
              className="task-checkbox"
              onClick={() => toggleTask(task.id)}
            >
              {task.completed ? (
                <CheckCircle2 size={24} color="#10b981" />
              ) : (
                <Circle size={24} />
              )}
            </button>
            <div className="task-content">
              <h3>{task.title}</h3>
              <div className="task-meta">
                <span className={`priority-badge ${task.priority}`}>
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span className="due-date">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="task-actions">
              <button className="icon-btn" title="Edit">
                <Edit2 size={18} />
              </button>
              <button className="icon-btn" onClick={() => deleteTask(task.id)} title="Delete">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="empty-state">
          <CheckCircle2 size={48} color="var(--text-muted)" />
          <p>No tasks found</p>
        </div>
      )}
    </div>
  )
}

export default Tasks




