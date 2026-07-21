'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  Video,
  AlignLeft,
  CalendarDays,
  Edit2,
  Eye
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
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  type: 'task' | 'project-deadline' | 'project-start' | 'meeting';
}

// Helper to format Date to YYYY-MM-DD in local timezone (to avoid UTC shift)
const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Generate time options in 30-minute intervals
const generateTimeOptions = () => {
  const times = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
      const ampm = i < 12 ? 'AM' : 'PM';
      const min = j === 0 ? '00' : '30';
      const value = `${i.toString().padStart(2, '0')}:${min}`;
      const label = `${hour}:${min} ${ampm}`;
      times.push({ value, label });
    }
  }
  return times;
};
const timeOptions = generateTimeOptions();

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  
  // Custom Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonthDate, setPickerMonthDate] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Custom Time Picker State
  const [showTimePicker, setShowTimePicker] = useState(false);
  const timePickerRef = useRef<HTMLDivElement>(null);

  const [newTask, setNewTask] = useState<Task>({
    title: '',
    description: '',
    date: '',
    time: '',
    status: 'pending',
    type: 'task'
  });

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    };
    if (showDatePicker || showTimePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker, showTimePicker]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
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
    const dateStr = formatLocalDate(date);
    const events: Task[] = [];

    const customTasks = tasks.filter(t => t.date === dateStr);
    events.push(...customTasks);

    projects.forEach(project => {
      if (project.startDate) {
        const startDate = new Date(project.startDate);
        if (formatLocalDate(startDate) === dateStr) {
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

      if (project.milestones && project.milestones.length > 0) {
        project.milestones.forEach(milestone => {
          if (milestone.dueDate) {
            const dueDate = new Date(milestone.dueDate);
            if (formatLocalDate(dueDate) === dateStr) {
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
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
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
    if (!date) return false;
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
      if (newTask._id) {
        // Update existing task
        const response = await fetch(`/api/schedule/tasks/${newTask._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });

        if (response.ok) {
          setTasks(tasks.map(t => t._id === newTask._id ? { ...newTask } : t));
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
      } else {
        // Create new task
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
      }
    } catch (error) {
      console.error('Error saving task:', error);
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

  const handleDragStart = (e: React.DragEvent, eventId: string, eventType: string) => {
    e.dataTransfer.setData('eventId', eventId);
    e.dataTransfer.setData('eventType', eventType);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('eventId');
    const eventType = e.dataTransfer.getData('eventType');

    if (!eventId || eventType === 'project-start' || eventType === 'project-deadline') return;

    try {
      const response = await fetch(`/api/schedule/tasks/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr })
      });

      if (response.ok) {
        setTasks(tasks.map(t => t._id === eventId ? { ...t, date: dateStr } : t));
      }
    } catch (error) {
      console.error('Error updating task date:', error);
    }
  };

  const getEventColorClass = (status: Task['status'], type: Task['type']) => {
    if (type === 'project-start') return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
    if (type === 'project-deadline') return 'bg-red-500/10 text-red-600 border border-red-500/20';
    if (status === 'completed') return 'bg-surface text-text-muted border border-border line-through opacity-70';
    if (status === 'cancelled') return 'bg-red-900/10 text-red-500 border border-red-900/20 opacity-70';
    if (status === 'in-progress') return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
    return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
  };

  const monthYear = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const selectedDateEvents = getEventsForDate(selectedDate);
  
  // Format string for date picker display
  const formatPickerDate = (dateStr: string) => {
    if (!dateStr) return 'Select date';
    // Convert YYYY-MM-DD local to Date taking timezone out of the picture
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-4 bg-background h-[calc(100vh-2rem)] flex flex-col rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-medium text-text-primary mb-0.5">Schedule & Calendar</h1>
          <p className="text-xs text-text-muted">Manage your projects, meetings, and daily tasks</p>
        </div>
        <button
          onClick={() => {
            setShowTaskModal(true);
            const initialDate = formatLocalDate(selectedDate);
            setNewTask({ ...newTask, date: initialDate, time: '12:00' });
            setPickerMonthDate(new Date(selectedDate));
          }}
          className="px-3 py-1.5 bg-primary text-background rounded-lg text-sm font-semibold hover:shadow-lg transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        
        {/* Calendar Column */}
        <div className="lg:col-span-2 flex flex-col bg-surface/30 rounded-xl border border-border overflow-hidden">
          <div className="p-4 flex flex-col h-full">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-xl font-semibold text-text-primary">{monthYear}</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-surface hover:bg-surface/80 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setCurrentDate(new Date());
                    setSelectedDate(new Date());
                  }}
                  className="px-4 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition text-sm font-medium"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-surface hover:bg-surface/80 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2 mb-2 shrink-0">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-text-muted py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days (Scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-7 gap-2">
                {days.map((date, index) => {
                  const dateStr = date ? formatLocalDate(date) : '';
                  const events = date ? getEventsForDate(date) : [];
                  
                  return (
                    <div
                      key={index}
                      onDragOver={date ? handleDragOver : undefined}
                      onDrop={date ? (e) => handleDrop(e, dateStr) : undefined}
                      onClick={() => {
                        if (date) setSelectedDate(date);
                      }}
                      className={`
                        h-[85px] p-1.5 rounded-lg border transition-colors relative flex flex-col group
                        ${!date ? 'bg-surface/50 border-transparent' : 'bg-background border-border hover:border-primary/50 cursor-pointer'}
                        ${date && isSelectedDate(date) ? 'ring-2 ring-primary bg-primary/5 border-transparent' : ''}
                      `}
                    >
                      {date && (
                        <>
                          <div className={`
                            text-xs font-semibold mb-2 self-end w-6 h-6 flex items-center justify-center rounded-full
                            ${isToday(date) ? 'bg-primary text-background' : 'text-text-primary group-hover:bg-surface'}
                            ${isSelectedDate(date) && !isToday(date) ? 'bg-primary/10 text-primary' : ''}
                          `}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-1 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                            {events.map((event, i) => (
                              <div
                                key={i}
                                draggable={!!event._id && (event.type === 'task' || event.type === 'meeting')}
                                onDragStart={(e) => {
                                  if (event._id) {
                                    e.stopPropagation();
                                    handleDragStart(e, event._id, event.type);
                                  }
                                }}
                                className={`
                                  text-[10px] px-1.5 py-1 rounded flex flex-col gap-0.5 w-full truncate
                                  ${getEventColorClass(event.status, event.type)}
                                  ${!!event._id && (event.type === 'task' || event.type === 'meeting') ? 'cursor-grab active:cursor-grabbing' : ''}
                                `}
                              >
                                <div className="flex items-center gap-1 font-medium truncate">
                                  {event.type === 'meeting' && <Video className="w-2.5 h-2.5 shrink-0" />}
                                  <span className="truncate">{event.title}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Details Column */}
        <div className="lg:col-span-1 flex flex-col bg-surface/30 rounded-xl border border-border overflow-hidden">
          <div className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <h3 className="font-semibold text-lg text-text-primary">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-xs text-text-muted mt-1">{selectedDateEvents.length} events scheduled</p>
              </div>
              <button
                onClick={() => {
                  setShowTaskModal(true);
                  const initialDate = formatLocalDate(selectedDate);
                  setNewTask({ ...newTask, date: initialDate, time: '12:00' });
                  setPickerMonthDate(new Date(selectedDate));
                }}
                className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition"
                title="Add event for this day"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3 pr-2">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center text-text-muted">
                  <CalendarIcon className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">No events scheduled for this day.</p>
                </div>
              ) : (
                selectedDateEvents.map((event, index) => (
                  <div key={index} className={`p-4 rounded-xl border bg-background flex flex-col gap-3 ${getEventColorClass(event.status, event.type).split(' ')[0]} bg-opacity-30`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {event.type === 'meeting' && <Video className="w-4 h-4 text-text-muted" />}
                          {event.type === 'task' && <CheckCircle2 className="w-4 h-4 text-text-muted" />}
                          {(event.type === 'project-start' || event.type === 'project-deadline') && <AlertCircle className="w-4 h-4 text-text-muted" />}
                          <h4 className="font-semibold text-text-primary truncate">{event.title}</h4>
                        </div>
                        
                        {event.clientName && (
                          <div className="text-xs text-text-muted flex items-center space-x-1 mt-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span className="truncate">{event.clientName}</span>
                          </div>
                        )}
                        {event.projectName && (
                          <div className="text-xs text-text-muted flex items-center space-x-1 mt-1">
                            <FolderKanban className="w-3.5 h-3.5" />
                            <span className="truncate">{event.projectName}</span>
                          </div>
                        )}
                        {event.time && (
                          <div className="text-xs text-text-muted flex items-center space-x-1 mt-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{timeOptions.find(t => t.value === event.time)?.label || event.time}</span>
                          </div>
                        )}
                      </div>
                      
                      {event._id && (event.type === 'task' || event.type === 'meeting') && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setViewingTask(event)}
                            className="p-1.5 hover:bg-surface rounded-lg text-text-muted hover:text-primary transition"
                            title="View Event"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setNewTask({ ...event });
                              setPickerMonthDate(new Date(event.date));
                              setShowTaskModal(true);
                            }}
                            className="p-1.5 hover:bg-surface rounded-lg text-text-muted hover:text-primary transition"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <select
                            value={event.status}
                            onChange={(e) => updateTaskStatus(event._id!, e.target.value as Task['status'])}
                            className="ta-input text-xs px-2 py-1 h-auto w-auto bg-background"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      )}
                    </div>
                    
                    {event.description && (
                      <div className="text-xs text-text-muted bg-surface/50 p-2 rounded-lg border border-border/50 flex gap-2 items-start">
                        <AlignLeft className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-50" />
                        <p className="break-words line-clamp-3">{event.description}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task/Event Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl shadow-2xl max-w-md w-full p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">
                {newTask._id ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 hover:bg-surface rounded-lg text-text-muted transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Event Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setNewTask({ ...newTask, type: 'task' })}
                    className={`py-2 px-4 rounded-lg text-sm font-medium border transition flex items-center justify-center gap-2 ${
                      newTask.type === 'task'
                        ? 'bg-primary/10 text-primary border-primary'
                        : 'bg-surface text-text-primary border-border hover:border-primary/50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Task
                  </button>
                  <button
                    onClick={() => setNewTask({ ...newTask, type: 'meeting' })}
                    className={`py-2 px-4 rounded-lg text-sm font-medium border transition flex items-center justify-center gap-2 ${
                      newTask.type === 'meeting'
                        ? 'bg-primary/10 text-primary border-primary'
                        : 'bg-surface text-text-primary border-border hover:border-primary/50'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Meeting
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary outline-none"
                  placeholder="Enter event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative" ref={datePickerRef}>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Date
                  </label>
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary outline-none flex items-center gap-2 hover:border-primary/50 transition text-sm"
                  >
                    <CalendarDays className="w-4 h-4 text-text-muted" />
                    {formatPickerDate(newTask.date)}
                  </button>
                  
                  {/* Custom Date Picker Popover */}
                  <AnimatePresence>
                    {showDatePicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 p-3 bg-background border border-border shadow-2xl rounded-xl z-50 w-[280px]"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <button
                            onClick={() => setPickerMonthDate(new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth() - 1))}
                            className="p-1 hover:bg-surface rounded-md"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <div className="text-sm font-semibold">
                            {pickerMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </div>
                          <button
                            onClick={() => setPickerMonthDate(new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth() + 1))}
                            className="p-1 hover:bg-surface rounded-md"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-1">
                          {weekDays.map(d => (
                            <div key={d} className="text-center text-[10px] text-text-muted font-medium">{d.slice(0,2)}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {getDaysInMonth(pickerMonthDate).map((d, i) => (
                            <button
                              key={i}
                              disabled={!d}
                              onClick={() => {
                                if (d) {
                                  setNewTask({ ...newTask, date: formatLocalDate(d) });
                                  setShowDatePicker(false);
                                }
                              }}
                              className={`
                                h-8 w-8 rounded-full flex items-center justify-center text-xs
                                ${!d ? 'invisible' : 'hover:bg-surface'}
                                ${d && formatLocalDate(d) === newTask.date ? 'bg-primary text-background hover:bg-primary' : ''}
                                ${d && isToday(d) && formatLocalDate(d) !== newTask.date ? 'text-primary font-bold' : ''}
                              `}
                            >
                              {d?.getDate()}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="relative" ref={timePickerRef}>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Time
                  </label>
                  <button
                    onClick={() => setShowTimePicker(!showTimePicker)}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary outline-none flex items-center justify-between hover:border-primary/50 transition text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-text-muted" />
                      <span>{timeOptions.find(t => t.value === newTask.time)?.label || 'All Day'}</span>
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {showTimePicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 bg-background border border-border shadow-2xl rounded-xl z-50 w-full max-h-60 overflow-y-auto custom-scrollbar py-2"
                      >
                        <button
                          onClick={() => {
                            setNewTask({ ...newTask, time: '' });
                            setShowTimePicker(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-surface transition ${!newTask.time ? 'bg-primary/10 text-primary font-medium' : 'text-text-primary'}`}
                        >
                          All Day
                        </button>
                        {timeOptions.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => {
                              setNewTask({ ...newTask, time: t.value });
                              setShowTimePicker(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-surface transition ${newTask.time === t.value ? 'bg-primary/10 text-primary font-medium' : 'text-text-primary'}`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Project Link (Optional)
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
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary outline-none text-sm"
                >
                  <option value="">Select a project...</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.projectName} - {project.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary outline-none resize-none text-sm"
                  rows={2}
                  placeholder="Enter details..."
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-2.5 border border-border text-text-primary font-medium rounded-lg hover:bg-surface transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex-1 px-4 py-2.5 bg-primary text-background font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition"
                >
                  Save Event
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Event Modal */}
      {viewingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl shadow-2xl max-w-md w-full p-6 border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">View Event</h3>
              <button
                onClick={() => setViewingTask(null)}
                className="p-2 hover:bg-surface rounded-lg text-text-muted transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Title</span>
                <p className="text-text-primary font-medium mt-1">{viewingTask.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Date</span>
                  <p className="text-text-primary mt-1">{formatPickerDate(viewingTask.date)}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Time</span>
                  <p className="text-text-primary mt-1">{timeOptions.find(t => t.value === viewingTask.time)?.label || viewingTask.time || 'All Day'}</p>
                </div>
              </div>
              {viewingTask.projectName && (
                <div>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Project</span>
                  <p className="text-text-primary mt-1">{viewingTask.projectName} {viewingTask.clientName ? `(${viewingTask.clientName})` : ''}</p>
                </div>
              )}
              {viewingTask.description && (
                <div>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Description</span>
                  <div className="bg-surface/50 p-3 rounded-lg border border-border/50 mt-1">
                    <p className="text-sm text-text-primary break-words whitespace-pre-wrap">{viewingTask.description}</p>
                  </div>
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Status</span>
                <p className="text-text-primary mt-1 capitalize">{viewingTask.status}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
