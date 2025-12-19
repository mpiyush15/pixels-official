'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  User,
  FolderKanban,
  CheckCircle2,
  Circle,
  AlertCircle,
  X
} from 'lucide-react';

interface Project {
  _id: string;
  projectName: string;
  clientName: string;
  status: string;
  startDate?: string;
  milestones?: Array<{
    name: string;
    dueDate: string;
    status: string;
  }>;
  color?: string;
}

interface Task {
  _id?: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  projectId?: string;
  projectName?: string;
  clientName?: string;
  status: 'pending' | 'in-progress' | 'completed';
  type: 'task' | 'project-deadline' | 'project-start';
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<Task>({
    title: '',
    description: '',
    date: '',
    time: '',
    status: 'pending',
    type: 'task'
  });
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      // API returns array directly, not wrapped in success object
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/schedule/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const getEventsForDate = (date: Date): Task[] => {
    const dateStr = date.toISOString().split('T')[0];
    const events: Task[] = [];

    // Add custom tasks
    const customTasks = tasks.filter(t => t.date === dateStr);
    events.push(...customTasks);

    // Add project milestones as deadlines
    projects.forEach(project => {
      // Add project start date
      if (project.startDate) {
        const startDate = new Date(project.startDate).toISOString().split('T')[0];
        if (startDate === dateStr) {
          events.push({
            title: `${project.projectName} - Start`,
            date: dateStr,
            projectId: project._id,
            projectName: project.projectName,
            clientName: project.clientName,
            status: 'in-progress',
            type: 'project-start'
          });
        }
      }

      // Add milestone deadlines
      if (project.milestones && project.milestones.length > 0) {
        project.milestones.forEach(milestone => {
          if (milestone.dueDate) {
            const dueDate = new Date(milestone.dueDate).toISOString().split('T')[0];
            if (dueDate === dateStr) {
              events.push({
                title: `${project.projectName} - ${milestone.name}`,
                date: dateStr,
                projectId: project._id,
                projectName: project.projectName,
                clientName: project.clientName,
                status: milestone.status === 'completed' ? 'completed' : 'pending',
                type: 'project-deadline'
              });
            }
          }
        });
      }
    });

    return events;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.date) {
      alert('Please fill in title and date');
      return;
    }

    try {
      const response = await fetch('/api/schedule/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });

      const data = await response.json();
      if (data.success) {
        setTasks([...tasks, data.task]);
        setShowTaskModal(false);
        setNewTask({
          title: '',
          description: '',
          date: '',
          time: '',
          status: 'pending',
          type: 'task'
        });
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch(`/api/schedule/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setTasks(tasks.map(t => t._id === taskId ? { ...t, status } : t));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule & Calendar</h1>
        <p className="text-gray-600">Manage your projects, deadlines, and daily tasks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{monthYear}</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                const events = date ? getEventsForDate(date) : [];
                const hasEvents = events.length > 0;
                
                return (
                  <motion.div
                    key={index}
                    whileHover={date ? { scale: 1.05 } : {}}
                    className={`
                      min-h-[100px] p-2 rounded-lg border transition cursor-pointer
                      ${!date ? 'bg-gray-50 border-gray-100' : ''}
                      ${date && isToday(date) ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : ''}
                      ${date && isSelectedDate(date) ? 'bg-purple-50 border-purple-300' : ''}
                      ${date && !isToday(date) && !isSelectedDate(date) ? 'bg-white border-gray-200 hover:border-blue-300' : ''}
                    `}
                    onClick={() => date && setSelectedDate(date)}
                  >
                    {date && (
                      <>
                        <div className={`
                          text-sm font-semibold mb-1
                          ${isToday(date) ? 'text-blue-600' : 'text-gray-700'}
                        `}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {events.slice(0, 2).map((event, i) => (
                            <div
                              key={i}
                              className={`
                                text-xs px-2 py-1 rounded truncate
                                ${event.type === 'project-deadline' ? 'bg-red-100 text-red-700' : ''}
                                ${event.type === 'project-start' ? 'bg-green-100 text-green-700' : ''}
                                ${event.type === 'task' && event.status === 'completed' ? 'bg-gray-100 text-gray-500 line-through' : ''}
                                ${event.type === 'task' && event.status !== 'completed' ? 'bg-blue-100 text-blue-700' : ''}
                              `}
                            >
                              {event.title}
                            </div>
                          ))}
                          {events.length > 2 && (
                            <div className="text-xs text-gray-500 px-2">
                              +{events.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Add Task Button */}
          <button
            onClick={() => {
              setShowTaskModal(true);
              setNewTask({
                ...newTask,
                date: selectedDate ? selectedDate.toISOString().split('T')[0] : ''
              });
            }}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                {selectedDate.toLocaleDateString('default', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">{event.title}</div>
                        {event.clientName && (
                          <div className="text-xs text-gray-500 flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{event.clientName}</span>
                          </div>
                        )}
                        {event.time && (
                          <div className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                          </div>
                        )}
                      </div>
                      {event._id && event.type === 'task' && (
                        <select
                          value={event.status}
                          onChange={(e) => updateTaskStatus(event._id!, e.target.value as Task['status'])}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
                {getEventsForDate(selectedDate).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No events scheduled</p>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Upcoming Deadlines</span>
            </h3>
            <div className="space-y-2">
              {projects
                .filter(p => p.milestones && p.milestones.length > 0 && p.status !== 'completed')
                .flatMap(project => 
                  (project.milestones || [])
                    .filter(m => m.dueDate && new Date(m.dueDate) > new Date() && m.status !== 'completed')
                    .map(milestone => ({
                      ...project,
                      milestoneName: milestone.name,
                      milestoneDate: milestone.dueDate
                    }))
                )
                .sort((a, b) => new Date(a.milestoneDate).getTime() - new Date(b.milestoneDate).getTime())
                .slice(0, 5)
                .map((item, index) => (
                  <div key={index} className="p-2 bg-red-50 rounded-lg border border-red-200">
                    <div className="font-medium text-sm text-gray-900">{item.projectName}</div>
                    <div className="text-xs text-gray-600">{item.clientName}</div>
                    <div className="text-xs text-blue-600 mt-1">{item.milestoneName}</div>
                    <div className="text-xs text-red-600 mt-1">
                      Due: {new Date(item.milestoneDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              {projects.filter(p => p.milestones && p.milestones.length > 0).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No upcoming deadlines</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Add New Task</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={newTask.date}
                  onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time (Optional)
                </label>
                <input
                  type="time"
                  value={newTask.time}
                  onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link to Project (Optional)
                </label>
                <select
                  value={newTask.projectId || ''}
                  onChange={(e) => {
                    const project = projects.find(p => p._id === e.target.value);
                    setNewTask({ 
                      ...newTask, 
                      projectId: e.target.value,
                      projectName: project?.projectName,
                      clientName: project?.clientName
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.projectName} - {project.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
                >
                  Add Task
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
