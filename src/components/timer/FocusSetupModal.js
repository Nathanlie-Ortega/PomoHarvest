// src/components/timer/FocusSetupModal.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FocusSetupModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [focusHours, setFocusHours] = useState(0);
  const [focusMinutes, setFocusMinutes] = useState(25); // Default is "Classic Harvest" (25 min)
  const [breakMinutes, setBreakMinutes] = useState(5); // Default is "Stretch Break" (5 min)
  const [breakEnabled, setBreakEnabled] = useState(true);
  const [description, setDescription] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('carrot'); // Default plant type
  const [showFocusDropdown, setShowFocusDropdown] = useState(false);
  const [showBreakDropdown, setShowBreakDropdown] = useState(false);
  const [showPlantDropdown, setShowPlantDropdown] = useState(false);
  const [customFocusMinutes, setCustomFocusMinutes] = useState('');
  const [customBreakMinutes, setCustomBreakMinutes] = useState('');
  const [currentFocusCategory, setCurrentFocusCategory] = useState('classic'); // Default category
  const [currentBreakCategory, setCurrentBreakCategory] = useState('stretch'); // Default category
  const [showCustomFocusInput, setShowCustomFocusInput] = useState(false);
  const [showCustomBreakInput, setShowCustomBreakInput] = useState(false);
  
  // Predefined focus session types with categories and ranges
  const focusSessionTypes = [
    { name: "Quick Grow", duration: 15, category: 'quick', emoji: '🟢', range: [1, 15] },
    { name: "Classic Harvest", duration: 25, category: 'classic', emoji: '🟡', range: [16, 25] },
    { name: "Deep Root", duration: 45, category: 'deep', emoji: '🔵', range: [26, 45] },
    { name: "Custom Bloom", duration: null, category: 'custom', emoji: '🟣', range: [1, 999] }
  ];
  
  // Predefined break types with categories and ranges
  const breakTypes = [
    { name: "No Break", duration: 0, category: 'none', emoji: '🚫', range: [0, 0] },
    { name: "Stretch Break", duration: 5, category: 'stretch', emoji: '🧘', range: [1, 5] },
    { name: "Refuel Break", duration: 10, category: 'refuel', emoji: '🍎', range: [6, 10] },
    { name: "Rebirth Break", duration: 30, category: 'rebirth', emoji: '🔄', range: [11, 30] },
    { name: "Custom Break", duration: null, category: 'custom', emoji: '🧩', range: [1, 999] }
  ];
  
  // Predefined plant types
  const plantTypes = [
    { name: "🥕 Carrot", value: "carrot" },
    { name: "🍅 Tomato", value: "tomato" },
    { name: "🌾 Wheat", value: "wheat" }
  ];
  
  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setShowFocusDropdown(false);
    setShowBreakDropdown(false);
    setShowPlantDropdown(false);
  };

  // Function to toggle a specific dropdown and close others
  const toggleDropdown = (dropdown) => {
    // Check if the clicked dropdown is already open
    switch(dropdown) {
      case 'focus':
        if (showFocusDropdown) {
          // If already open, just close it
          setShowFocusDropdown(false);
          return;
        }
        break;
      case 'break':
        if (showBreakDropdown) {
          // If already open, just close it
          setShowBreakDropdown(false);
          return;
        }
        break;
      case 'plant':
        if (showPlantDropdown) {
          // If already open, just close it
          setShowPlantDropdown(false);
          return;
        }
        break;
      default:
        break;
    }
    
    // If we reach here, the clicked dropdown is not open, so close all and open the clicked one
    closeAllDropdowns();
    switch(dropdown) {
      case 'focus':
        setShowFocusDropdown(true);
        break;
      case 'break':
        setShowBreakDropdown(true);
        break;
      case 'plant':
        setShowPlantDropdown(true);
        break;
      default:
        break;
    }
  };
  
  // Update focus category based on focus time
  useEffect(() => {
    const totalMinutes = focusHours * 60 + focusMinutes;
    
    if (totalMinutes >= 1 && totalMinutes <= 15) {
      setCurrentFocusCategory('quick');
    } else if (totalMinutes >= 16 && totalMinutes <= 25) {
      setCurrentFocusCategory('classic');
    } else if (totalMinutes >= 26 && totalMinutes <= 45) {
      setCurrentFocusCategory('deep');
    } else {
      setCurrentFocusCategory('custom');
    }
  }, [focusHours, focusMinutes]);
  
  // Update break category based on break time
  useEffect(() => {
    if (!breakEnabled) {
      setCurrentBreakCategory('none');
      return;
    }
    
    if (breakMinutes >= 1 && breakMinutes <= 5) {
      setCurrentBreakCategory('stretch');
    } else if (breakMinutes >= 6 && breakMinutes <= 10) {
      setCurrentBreakCategory('refuel');
    } else if (breakMinutes >= 11 && breakMinutes <= 30) {
      setCurrentBreakCategory('rebirth');
    } else {
      setCurrentBreakCategory('custom');
    }
  }, [breakEnabled, breakMinutes]);
  
  // Handle custom focus minutes input change
  const handleCustomFocusMinutesChange = (e) => {
    const value = e.target.value;
    // Allow only numbers or empty string
    if (value === '' || /^[0-9]+$/.test(value)) {
      setCustomFocusMinutes(value);
    } else {
      alert('Please enter only numeric values.');
    }
  };
  
  // Handle custom break minutes input change
  const handleCustomBreakMinutesChange = (e) => {
    const value = e.target.value;
    // Allow only numbers or empty string
    if (value === '' || /^[0-9]+$/.test(value)) {
      setCustomBreakMinutes(value);
    } else {
      alert('Please enter only numeric values.');
    }
  };
  
  // Handle custom focus minutes submission
  const handleCustomFocusMinutes = () => {
    let minutes = parseInt(customFocusMinutes);
    
    if (isNaN(minutes) || customFocusMinutes === '') {
      alert('Please enter a valid number.');
      return;
    }
    
    // Cap at 999 minutes as specified
    if (minutes > 999) {
      minutes = 999;
      alert('Maximum focus duration is 999 minutes. Setting to 999.');
    }
    
    // Enforce minimum of 1 minute
    if (minutes < 1) {
      minutes = 1;
      alert('Minimum focus duration is 1 minute. Setting to 1.');
    }
    
    setFocusHours(Math.floor(minutes / 60));
    setFocusMinutes(minutes % 60);
    setCustomFocusMinutes('');
    setShowCustomFocusInput(false);
    closeAllDropdowns();
  };
  
  // Handle custom break minutes submission
  const handleCustomBreakMinutes = () => {
    let minutes = parseInt(customBreakMinutes);
    
    if (isNaN(minutes) || customBreakMinutes === '') {
      alert('Please enter a valid number.');
      return;
    }
    
    // Cap at 999 minutes as specified
    if (minutes > 999) {
      minutes = 999;
      alert('Maximum break duration is 999 minutes. Setting to 999.');
    }
    
    // Enforce minimum of 1 minute
    if (minutes < 1) {
      minutes = 1;
      alert('Minimum break duration is 1 minute. Setting to 1.');
    }
    
    setBreakMinutes(minutes);
    setBreakEnabled(true);
    setCustomBreakMinutes('');
    setShowCustomBreakInput(false);
    closeAllDropdowns();
  };
  
  // Validate focus time is within bounds (minimum 1 minute, maximum 999 minutes)
  const validateFocusTime = () => {
    let validHours = Math.min(Math.max(focusHours, 0), 16); // Cap at 16 hours (960 minutes)
    let validMinutes = Math.min(Math.max(focusMinutes, 0), 60);
    
    // Ensure at least 1 minute total
    const totalMinutes = validHours * 60 + validMinutes;
    if (totalMinutes < 1) {
      validHours = 0;
      validMinutes = 1;
    } else if (totalMinutes > 999) {
      validHours = 16;
      validMinutes = 39; // 999 minutes equals 16 hours and 39 minutes
    }
    
    setFocusHours(validHours);
    setFocusMinutes(validMinutes);
    return { hours: validHours, minutes: validMinutes, totalMinutes: validHours * 60 + validMinutes };
  };
  
  // Validate break time is within bounds (0 to 999 minutes)
  const validateBreakTime = () => {
    if (!breakEnabled) return 0;
    return Math.min(Math.max(breakMinutes, 1), 999);
  };
  
  // Generate focus session type options
  const generateFocusTypeOptions = () => {
    return focusSessionTypes.map((type, index) => (
      <button
        key={index}
        type="button"
        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          currentFocusCategory === type.category ? 'bg-primary-100 dark:bg-primary-900/20' : ''
        }`}
        onClick={() => {
          if (type.category === 'custom') {
            // Show the custom input
            setShowCustomFocusInput(true);
          } else {
            setFocusHours(Math.floor(type.duration / 60));
            setFocusMinutes(type.duration % 60);
            setShowCustomFocusInput(false);
            closeAllDropdowns();
          }
        }}
      >
        {type.emoji} {type.name} {type.duration ? `(${type.duration} min)` : '(Custom)'}
      </button>
    ));
  };
  
  // Generate custom focus input
  const generateCustomFocusInput = () => (
    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col space-y-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Enter custom duration (1-999 minutes):
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={customFocusMinutes}
            onChange={handleCustomFocusMinutesChange}
            placeholder="1-999 minutes"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            style={{ color: 'black', backgroundColor: 'white' }}
            min="1"
            max="999"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCustomFocusMinutes()}
          />
          <button
            type="button"
            onClick={handleCustomFocusMinutes}
            className="px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            Set
          </button>
        </div>
        <div className="text-xs text-gray-500 italic">
          Note: Your custom time will be categorized based on the duration ranges.
        </div>
      </div>
    </div>
  );
  
  // Generate break type options
  const generateBreakTypeOptions = () => {
    return breakTypes.map((type, index) => (
      <button
        key={index}
        type="button"
        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          currentBreakCategory === type.category ? 'bg-primary-100 dark:bg-primary-900/20' : ''
        }`}
        onClick={() => {
          if (type.category === 'none') {
            setBreakEnabled(false);
            setShowCustomBreakInput(false);
            closeAllDropdowns();
          } else if (type.category === 'custom') {
            // Show the custom input
            setShowCustomBreakInput(true);
            setBreakEnabled(true);
          } else {
            setBreakEnabled(true);
            setBreakMinutes(type.duration);
            setShowCustomBreakInput(false);
            closeAllDropdowns();
          }
        }}
      >
        {type.emoji} {type.name} {type.duration > 0 ? `(${type.duration} min)` : type.duration === 0 ? '' : '(Custom)'}
      </button>
    ));
  };
  
  // Generate custom break input
  const generateCustomBreakInput = () => (
    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col space-y-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Enter custom break duration (1-999 minutes):
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={customBreakMinutes}
            onChange={handleCustomBreakMinutesChange}
            placeholder="1-999 minutes"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            style={{ color: 'black', backgroundColor: 'white' }}
            min="1"
            max="999"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCustomBreakMinutes()}
          />
          <button
            type="button"
            onClick={handleCustomBreakMinutes}
            className="px-3 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            Set
          </button>
        </div>
        <div className="text-xs text-gray-500 italic">
          Note: Your custom break will be categorized based on the duration ranges.
        </div>
      </div>
    </div>
  );
  
  // Generate plant type options
  const generatePlantTypeOptions = () => {
    return plantTypes.map((type, index) => (
      <button
        key={index}
        type="button"
        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          selectedPlant === type.value ? 'bg-primary-100 dark:bg-primary-900/20' : ''
        }`}
        onClick={() => {
          setSelectedPlant(type.value);
          closeAllDropdowns();
        }}
      >
        {type.name}
      </button>
    ));
  };
  
  // Get current focus category info
  const getCurrentFocusType = () => {
    return focusSessionTypes.find(type => type.category === currentFocusCategory) || focusSessionTypes[1];
  };
  
  // Get current break category info
  const getCurrentBreakType = () => {
    return breakTypes.find(type => type.category === currentBreakCategory) || breakTypes[1];
  };
  
  // Format time for display (e.g., "25:00")
  const formatTime = (hours, minutes) => {
    return `${hours > 0 ? `${hours}:` : ''}${String(minutes).padStart(2, '0')}:00`;
  };
  
  // Get current plant type
  const getCurrentPlantType = () => {
    const plant = plantTypes.find(p => p.value === selectedPlant);
    return plant ? plant.name : plantTypes[0].name;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inputs
    const validFocus = validateFocusTime();
    const validBreak = validateBreakTime();
    
    // Get focus session type name
    let sessionTypeName = "Custom Bloom";
    
    if (validFocus.totalMinutes <= 15) {
      sessionTypeName = "Quick Grow";
    } else if (validFocus.totalMinutes <= 25) {
      sessionTypeName = "Classic Harvest";
    } else if (validFocus.totalMinutes <= 45) {
      sessionTypeName = "Deep Root";
    }
    
    // Get break type name
    let breakTypeName = "Custom Break";
    if (validBreak === 0) {
      breakTypeName = "No Break";
    } else if (validBreak <= 5) {
      breakTypeName = "Stretch Break";
    } else if (validBreak <= 10) {
      breakTypeName = "Refuel Break";
    } else if (validBreak <= 30) {
      breakTypeName = "Rebirth Break";
    }
    
    // Navigate to the focus page with settings
    navigate('/focus', {
      state: {
        focusHours: validFocus.hours,
        focusMinutes: validFocus.minutes,
        breakMinutes: validBreak,
        description,
        sessionTypeName,
        breakTypeName,
        selectedPlant
      }
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">
              Focus Session Setup
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Harvest Explanation */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300 border-l-4 border-green-400 mb-6">
              <p className="font-medium mb-1 flex items-center gap-2">
                <img src="/favicon.ico" alt="PomoHarvest Icon" className="w-5 h-5" />
                PomoHarvest:
              </p>

              <p>Choose your focus session type to grow different plants in your garden. Longer sessions yield greater harvests!</p>
              <p className="mt-2 text-sm italic">For best results, please stay on the focus page during your session. Leaving the website may reset your progress.</p>
            </div>
            
            <div className="space-y-6">
              {/* Focus Time Section */}
              <div>
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
                  Focus Session Type
                </h3>
                
                <div className="relative">
                  <button
                    type="button"
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={() => toggleDropdown('focus')}
                  >
                    <span className="text-lg font-mono">
                      {getCurrentFocusType().emoji} {getCurrentFocusType().name} {currentFocusCategory !== 'custom' ? `(${formatTime(focusHours, focusMinutes)})` : 
                      `(${focusHours > 0 ? `${focusHours}h ` : ''}${focusMinutes}m)`}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showFocusDropdown && (
                    <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 max-h-72 overflow-y-auto">
                      <div className="py-1">
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Session Types</div>
                        {generateFocusTypeOptions()}
                        
                        {showCustomFocusInput && generateCustomFocusInput()}
                        
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Quick Select</div>
                        
                        <div className="grid grid-cols-4 gap-1 px-3 py-2">
                          {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(minute => (
                            <button
                              key={minute}
                              type="button"
                              className={`px-2 py-1 text-center text-sm rounded ${
                                focusMinutes === minute && focusHours === 0
                                  ? 'bg-primary-100 dark:bg-primary-600'
                                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                              onClick={() => {
                                setFocusHours(0);
                                setFocusMinutes(minute);
                                setShowCustomFocusInput(false);
                                closeAllDropdowns();
                              }}
                            >
                              {minute}m
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Break Time Section */}
              <div>
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
                  Break Type
                </h3>
                
                <div className="relative">
                  <button
                    type="button"
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={() => toggleDropdown('break')}
                  >
                    <span className="text-lg font-mono">
                      {getCurrentBreakType().emoji} {getCurrentBreakType().name} {breakEnabled && breakMinutes > 0 && currentBreakCategory !== 'custom' ? `(${String(breakMinutes).padStart(2, '0')}:00)` : 
                      breakEnabled && currentBreakCategory === 'custom' ? `(${breakMinutes >= 60 ? `${Math.floor(breakMinutes / 60)}h ${breakMinutes % 60}m` : `${breakMinutes}m`})` : ''}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showBreakDropdown && (
                    <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 max-h-72 overflow-y-auto">
                      <div className="py-1">
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Break Types</div>
                        {generateBreakTypeOptions()}
                        
                        {showCustomBreakInput && breakEnabled && generateCustomBreakInput()}
                        
                        {breakEnabled && (
                          <>
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Quick Select</div>
                            
                            <div className="grid grid-cols-4 gap-1 px-3 py-2">
                              {[1, 3, 5, 7, 10, 15, 20, 30].map(minute => (
                                <button
                                  key={minute}
                                  type="button"
                                  className={`px-2 py-1 text-center text-sm rounded ${
                                    breakMinutes === minute
                                      ? 'bg-primary-100 dark:bg-primary-600'
                                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                  }`}
                                  onClick={() => {
                                    setBreakMinutes(minute);
                                    setBreakEnabled(true);
                                    setShowCustomBreakInput(false);
                                    closeAllDropdowns();
                                  }}
                                >
                                  {minute}m
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Plant Selection Section */}
              <div>
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
                  Select Your Plant
                </h3>
                
                <div className="relative">
                  <button
                    type="button"
                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={() => toggleDropdown('plant')}
                  >
                    <span className="text-lg font-mono">
                      {getCurrentPlantType()}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showPlantDropdown && (
                    <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                      <div className="py-1">
                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 font-medium">Plant Types</div>
                        {generatePlantTypeOptions()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  What are you focusing today? (optional)
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you'll be working on..."
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm 
                           focus:outline-none focus:ring-primary-500 focus:border-primary-500 
                           dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Start Growing
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FocusSetupModal;