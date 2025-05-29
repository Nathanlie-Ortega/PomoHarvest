import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const TodoForm = ({ onAdd, onCancel, editingTodo = null }) => {
  // Basic info states
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Reminder states
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState('8');
  const [reminderMinute, setReminderMinute] = useState('00');
  const [reminderAmPm, setReminderAmPm] = useState('AM');
  const [reminderDays, setReminderDays] = useState({
    mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false
  });
  
  // Goal states
  const [goalEnabled, setGoalEnabled] = useState(false);
  const [goalHours, setGoalHours] = useState(1);
  
  // Progress & habit states
  const [resetGoal, setResetGoal] = useState('never');
  const [habitTracking, setHabitTracking] = useState('off');
  
  // Initialize the form if editing an existing task
  useEffect(() => {
    if (editingTodo) {
      setName(editingTodo.name || '');
      setNotes(editingTodo.notes || '');
      setShowAdvanced(!!(editingTodo.reminder || editingTodo.goal || editingTodo.resetGoal !== 'never' || editingTodo.habitTracking !== 'off'));
      
      // Set reminder fields if available
      if (editingTodo.reminderTime) {
        setReminderEnabled(true);
        
        // Parse reminder time (e.g., "8:00 AM")
        const timeMatch = editingTodo.reminderTime.match(/(\d+):(\d+)\s?(AM|PM)/i);
        if (timeMatch) {
          setReminderHour(timeMatch[1]);
          setReminderMinute(timeMatch[2]);
          setReminderAmPm(timeMatch[3].toUpperCase());
        }
        
        // Set reminder days if available
        if (editingTodo.reminderDays) {
          setReminderDays(editingTodo.reminderDays);
        }
      }
      
      // Set goal if available
      if (editingTodo.goalHours) {
        setGoalEnabled(true);
        setGoalHours(editingTodo.goalHours);
      }
      
      // Set reset and habit preferences
      if (editingTodo.resetGoal) {
        setResetGoal(editingTodo.resetGoal);
      }
      
      if (editingTodo.habitTracking) {
        setHabitTracking(editingTodo.habitTracking);
      }
    }
  }, [editingTodo]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    // Format reminder time
    const reminderTime = reminderEnabled 
      ? `${reminderHour}:${reminderMinute} ${reminderAmPm}`
      : null;
    
    const todo = {
      id: editingTodo?.id || Date.now(),
      name: name.trim(),
      notes: notes.trim(),
      completed: editingTodo?.completed || false,
      reminderTime,
      reminderDays: reminderEnabled ? reminderDays : null,
      reminder: reminderEnabled ? formatReminder(reminderTime, reminderDays) : null,
      goalHours: goalEnabled ? goalHours : null,
      goal: goalEnabled ? `${goalHours}h` : null,
      resetGoal,
      habitTracking
    };
    
    onAdd(todo);
  };
  
  const formatReminder = (time, days) => {
    if (!time) return 'Set';
    
    const selectedDays = Object.entries(days)
      .filter(([_, selected]) => selected)
      .map(([day]) => day.charAt(0).toUpperCase())
      .join('');
    
    return selectedDays ? `${time} (${selectedDays})` : time;
  };
  
  const toggleDay = (day) => {
    setReminderDays({
      ...reminderDays,
      [day]: !reminderDays[day]
    });
  };
  
  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));
  
  // Generate minute options (00 to 55 in 5-minute intervals)
  const minuteOptions = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  // FIXED: Handle backdrop click - only close if clicking the backdrop itself
  const handleBackdropClick = (e) => {
    // Only close if the click target is exactly the backdrop element
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };
  
  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4" 
      style={{ zIndex: 50000 }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {editingTodo ? 'Edit Task' : 'Add New Task'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="taskName"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                placeholder="What do you need to do?"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="taskNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                id="taskNotes"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-h-[80px] resize-vertical"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional details here..."
              />
            </div>
            
            {!showAdvanced ? (
              <button
                type="button"
                className="text-green-600 dark:text-green-400 text-sm font-medium mb-4 hover:text-green-700 dark:hover:text-green-300 flex items-center"
                onClick={() => setShowAdvanced(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Reminder, Goals & More
              </button>
            ) : (
              <>
                {/* Reminder Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reminder
                    </label>
                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminderEnabled}
                        onChange={() => setReminderEnabled(!reminderEnabled)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  
                  {reminderEnabled && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Time
                        </label>
                        <div className="flex space-x-2">
                          <select
                            value={reminderHour}
                            onChange={(e) => setReminderHour(e.target.value)}
                            className="flex-1 px-2 py-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          >
                            {hourOptions.map(hour => (
                              <option key={hour} value={hour}>
                                {hour}
                              </option>
                            ))}
                          </select>
                          
                          <span className="flex items-center text-gray-700 dark:text-gray-300 font-bold">:</span>
                          
                          <select
                            value={reminderMinute}
                            onChange={(e) => setReminderMinute(e.target.value)}
                            className="flex-1 px-2 py-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          >
                            {minuteOptions.map(minute => (
                              <option key={minute} value={minute}>
                                {minute}
                              </option>
                            ))}
                          </select>
                          
                          <select
                            value={reminderAmPm}
                            onChange={(e) => setReminderAmPm(e.target.value)}
                            className="px-2 py-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Days
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { key: 'mon', label: 'M' },
                            { key: 'tue', label: 'T' },
                            { key: 'wed', label: 'W' },
                            { key: 'thu', label: 'T' },
                            { key: 'fri', label: 'F' },
                            { key: 'sat', label: 'S' },
                            { key: 'sun', label: 'S' }
                          ].map(day => (
                            <button
                              key={day.key}
                              type="button"
                              className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                                reminderDays[day.key]
                                  ? 'bg-green-600 text-white shadow-lg'
                                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              }`}
                              onClick={() => toggleDay(day.key)}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Goals Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Goals
                    </label>
                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={goalEnabled}
                        onChange={() => setGoalEnabled(!goalEnabled)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  
                  {goalEnabled && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                      <label htmlFor="goalHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Goal Hours
                      </label>
                      <input
                        type="number"
                        id="goalHours"
                        className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="1"
                        max="48"
                        value={goalHours}
                        onChange={(e) => setGoalHours(parseInt(e.target.value) || 1)}
                        placeholder="Enter hours (1-48)"
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
                
                {/* Additional Options */}
                <div className="mb-4 space-y-3">
                  <div>
                    <label htmlFor="resetGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reset Goal Progress
                    </label>
                    <select
                      id="resetGoal"
                      className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={resetGoal}
                      onChange={(e) => setResetGoal(e.target.value)}
                    >
                      <option value="never">Never</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="habitTracking" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Habit Tracker
                    </label>
                    <select
                      id="habitTracking"
                      className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={habitTracking}
                      onChange={(e) => setHabitTracking(e.target.value)}
                    >
                      <option value="off">Off</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            
            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  if (showAdvanced && !editingTodo) {
                    setShowAdvanced(false);
                  } else {
                    onCancel();
                  }
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                {showAdvanced && !editingTodo ? 'Back' : 'Cancel'}
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!name.trim()}
              >
                {editingTodo ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  
  // Use React Portal to render modal at the document body level
  return createPortal(modalContent, document.body);
};

export default TodoForm;