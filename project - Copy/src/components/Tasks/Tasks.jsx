import React, { useState, useEffect } from 'react'
import { Plus, CheckCircle2, Circle, Trash2, Edit2, Loader } from 'lucide-react'
import axios from 'axios'
import { useUsage } from '../../context/UsageContext'
import './Tasks.css'
import { toast } from 'react-hot-toast'

const Tasks = () => {
  const { fetchUsage } = useUsage()
  const [tasks, setTasks] = useState([])
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', dueDate: '', dueTime: '', reminderMinutesBefore: null })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [isEditing, setIsEditing] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8080/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTasks(response.data.data.map(task => ({
        ...task,
        completed: task.status === 'COMPLETED'
      })))
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Listen for new tasks created by Assistant
  useEffect(() => {
    const handleTaskCreated = () => fetchTasks()
    window.addEventListener('taskCreated', handleTaskCreated)
    return () => window.removeEventListener('taskCreated', handleTaskCreated)
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
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:8080/api/tasks/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(newStatus === 'COMPLETED' ? "Task completed! 🎉" : "Task marked as pending")
    } catch (error) {
      console.error('Failed to update task status:', error)
      toast.error("Failed to update status")
      fetchTasks()
    }
  }

  const validateTask = () => {
    const newErrors = {}
    const today = new Date().toISOString().split("T")[0]
    const now = new Date()

    if (!newTask.title.trim()) newErrors.title = 'Task title is required'
    if (!newTask.dueDate) newErrors.dueDate = 'Due date is required'
    else if (newTask.dueDate < today) newErrors.dueDate = 'Date cannot be in the past'

    if (newTask.dueTime && newTask.dueDate === today) {
      const selectedTime = new Date(`${newTask.dueDate}T${newTask.dueTime}`)
      if (selectedTime < now) newErrors.dueTime = 'Time must be in the future'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addTask = async () => {
    if (!validateTask()) return
    setIsLoading(true)

    try {
      const payload = {
        ...newTask,
        status: isEditing ? tasks.find(t => t.id === editingTaskId)?.status || 'PENDING' : 'PENDING',
        dueTime: newTask.dueDate && newTask.dueTime ? new Date(`${newTask.dueDate}T${newTask.dueTime}`).toISOString() : null
      }
      const token = localStorage.getItem('token')
      
      let response;
      if (isEditing) {
        response = await axios.put(`http://localhost:8080/api/tasks/${editingTaskId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Task updated successfully! ✨')
      } else {
        response = await axios.post('http://localhost:8080/api/tasks', payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.success('Task created successfully! 🚀')
      }
      
      setNewTask({ title: '', priority: 'medium', dueDate: '', dueTime: '', reminderMinutesBefore: null })
      setShowAddTask(false)
      setIsEditing(false)
      setEditingTaskId(null)
      fetchTasks() 
      await fetchUsage()
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.message || 'Failed to process task';
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (task) => {
    const dueDate = task.dueTime ? new Date(task.dueTime).toISOString().split('T')[0] : ''
    const dueTime = task.dueTime ? new Date(task.dueTime).toTimeString().split(' ')[0].substring(0, 5) : ''
    
    setNewTask({
      title: task.title,
      priority: task.priority.toLowerCase(),
      dueDate,
      dueTime,
      reminderMinutesBefore: task.reminderMinutesBefore
    })
    setEditingTaskId(task.id)
    setIsEditing(true)
    setShowAddTask(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteTask = async (id) => {
    const previousTasks = [...tasks]
    setTasks(tasks.filter(task => task.id !== id))

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8080/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success("Task deleted")
      fetchUsage()
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error("Failed to delete task")
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
        <div className="add-task-card glass-card">
          <h3>{isEditing ? 'Edit Task' : 'Create New Task'}</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className={`input ${errors.title ? 'input-error' : ''}`}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
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
            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className={`input ${errors.dueDate ? 'input-error' : ''}`}
                />
                {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
              </div>
              <div className="form-group">
                <label>Due Time</label>
                <input
                  type="time"
                  value={newTask.dueTime}
                  onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                  className={`input ${errors.dueTime ? 'input-error' : ''}`}
                />
                {errors.dueTime && <span className="error-text">{errors.dueTime}</span>}
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Reminder</label>
              <select
                value={newTask.reminderMinutesBefore || ''}
                onChange={(e) => setNewTask({ ...newTask, reminderMinutesBefore: e.target.value ? parseInt(e.target.value) : null })}
                className="input"
              >
                <option value="">No reminder</option>
                <option value="10">10 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setShowAddTask(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={addTask} disabled={isLoading}>
              {isLoading ? <Loader className="spinner" size={18} /> : null}
              {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Task' : 'Add Task')}
            </button>
          </div>
        </div>
      )}

      <div className="tasks-toolbar">
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

      <div className="tasks-list glass-card">
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
                {task.dueTime && (
                  <span className="due-date">
                    Due: {new Date(task.dueTime).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="task-actions">
              <button 
                className="icon-btn" 
                title="Edit"
                onClick={() => startEdit(task)}
              >
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
