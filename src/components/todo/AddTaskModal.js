import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { motion } from 'framer-motion';
import useLocalStorage from '../hooks/useLocalStorage';

const AddTaskModal = ({ isOpen, onClose, onTaskAdded }) => {
  const [tasks, setTasks] = useLocalStorage('tasks', []);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [reminderHours, setReminderHours] = useState('1');
  const [reminderMinutes, setReminderMinutes] = useState('00');
  const [taskCategory, setTaskCategory] = useState('personal');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskStatus, setTaskStatus] = useState('pending');

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('medium');
      setReminderHours('1');
      setReminderMinutes('00');
      setTaskCategory('personal');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTaskDeadline(tomorrow.toISOString().split('T')[0]);
      setTaskStatus('pending');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newTask = {
      id: Date.now(),
      title: taskTitle,
      description: taskDescription,
      priority: taskPriority,
      reminderTime: `${reminderHours}:${reminderMinutes}`,
      category: taskCategory,
      deadline: taskDeadline,
      createdAt: new Date().toISOString(),
      status: taskStatus,
      completed: false
    };
    
    setTasks([...tasks, newTask]);
    onTaskAdded(newTask);
    onClose();
  };

  // Generate hour options (1-12)
  const hoursOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  // Generate minute options (00-59)
  const minutesOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Task Title*
            </label>
            <input
              type="text"
              id="taskTitle"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="What do you need to do?"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="taskDescription"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              placeholder="Add details about your task"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="taskPriority"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="taskCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                id="taskCategory"
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reminder Time
            </label>
            <div className="flex space-x-2">
              <select
                value={reminderHours}
                onChange={(e) => setReminderHours(e.target.value)}
                className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                {hoursOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour} hr
                  </option>
                ))}
              </select>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(e.target.value)}
                className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                {minutesOptions.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute} min
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Selected: {reminderHours} hr {reminderMinutes} min
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="taskDeadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Deadline
            </label>
            <input
              type="date"
              id="taskDeadline"
              value={taskDeadline}
              onChange={(e) => setTaskDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add Task
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddTaskModal;