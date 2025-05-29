import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import TodoList from '../components/todo/TodoList';
import { useAuth } from '../hooks/useAuth';
import { useSound } from '../hooks/useSound';
import { doc, updateDoc, arrayUnion, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const FocusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { playSound } = useSound();
  
  // Get focus settings from navigation or use defaults
  const focusSettings = location.state || {
    focusHours: 0,
    focusMinutes: 25,
    breakMinutes: 5,
    description: '',
    sessionTypeName: 'Classic Harvest',
    breakTypeName: 'Stretch Break',
    selectedPlant: 'carrot' // Default plant type
  };
  
  // Calculate total seconds
  const initialSeconds = 
    (focusSettings.focusHours || 0) * 3600 + 
    (focusSettings.focusMinutes || 25) * 60;
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  
  // Dynamic break time based on focus count
  const [focusCount, setFocusCount] = useState(0); // Track completed Pomodoros
  const getBreakTime = () => focusCount % 4 === 0 && focusCount > 0 ? 15 * 60 : (focusSettings.breakMinutes * 60 || 300);
  const [breakTimeLeft, setBreakTimeLeft] = useState(getBreakTime());
  const [initialBreakTime, setInitialBreakTime] = useState(getBreakTime());
  
  // Track if a Pomodoro was just completed
  const [pomodoroCompleted, setPomodoroCompleted] = useState(false);
  
  // NEW: Track if user completed a full 4/4 Pomodoro cycle
  const [completedFullCycle, setCompletedFullCycle] = useState(false);
  
  // UI states
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [showPauseWarning, setShowPauseWarning] = useState(false);
  const [hidePauseWarning, setHidePauseWarning] = useState(false);
  const [showBreakConfirmation, setShowBreakConfirmation] = useState(false);
  const [showWitheredMessage, setShowWitheredMessage] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [manualBreakMessage, setManualBreakMessage] = useState(''); // New state for manual break message
  
  // Navigation protection states
  const [intendedDestination, setIntendedDestination] = useState(null);
  const [timerStateBeforeQuit, setTimerStateBeforeQuit] = useState(null);
  
  // Statistics tracking
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [totalPauseTime, setTotalPauseTime] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [pauseLimit] = useState(300); // 5 minute limit for pauses
  const [sessionFailed, setSessionFailed] = useState(false);
  
  // UPDATED: Enhanced pause penalty tracking
  const [pausePenaltiesApplied, setPausePenaltiesApplied] = useState(0); // Track how many pause penalties have been applied
  const [hasExceededPauseLimit, setHasExceededPauseLimit] = useState(false); // Track if we've exceeded the initial 5-minute limit
  
  // Plant growth tracking
  const [breakCount, setBreakCount] = useState(0);
  const [excessiveBreaks, setExcessiveBreaks] = useState(false);
  const [witherCount, setWitherCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Gardener Level states
  const [growthXP, setGrowthXP] = useState(0); // Temporary XP that resets after 4 Pomodoros
  const [harvestXP, setHarvestXP] = useState(0); // Permanent XP from completed cycles
  const [gardenerLevel, setGardenerLevel] = useState(1);
  const [xpToNextLevel, setXpToNextLevel] = useState(10); // Based on Fast Early Growth model
  const [xpPercentage, setXpPercentage] = useState(0);
  
  // Quotes and visual enhancements
  const [focusQuote, setFocusQuote] = useState('');
  const [quoteOpacity, setQuoteOpacity] = useState(1);
  const [inspirationalQuote, setInspirationalQuote] = useState('');
  const [breakQuoteOpacity, setBreakQuoteOpacity] = useState(1); // NEW: Break quote opacity
  
  // NEW: Spotify integration states
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false);
  const [showSpotifyLogin, setShowSpotifyLogin] = useState(false);
  const [spotifyPlayer, setSpotifyPlayer] = useState(null);
  const [albumArtBackground, setAlbumArtBackground] = useState(null);
  
  // Refs
  const timer = useRef(null);
  const focusQuoteTimer = useRef(null); // New ref for focus quote timer
  const breakQuoteTimer = useRef(null); // New ref for break quote timer
  const breakSoundRef = useRef(null);
  const documentVisibilityPaused = useRef(false);
  const pageLeaveListenerAdded = useRef(false);
  
  // Arrays of quotes
  const focusQuotes = [
    "Focus on the process, not the outcome.",
    "One task at a time leads to great achievements.",
    "Your attention is your most valuable resource.",
    "Distractions are temporary, but focus builds lasting results.",
    "Each focused minute plants seeds for future harvests.",
    "Concentration is the soil where ideas grow.",
    "In the garden of productivity, focus is the water.",
    "Your dedication now will bloom into accomplishments later.",
    "Growing your focus grows your potential.",
    "As you tend to your work, you tend to your growth.",
    "A moment of concentration is worth hours of distraction.",
    "Every focused second nurtures your goals.",
    "Plant your attention firmly in the present moment.",
    "The seeds of success are watered with consistent focus.",
    "Your concentration cultivates your future.",
    "Tending to one task at a time yields the richest harvest."
  ];
  
  const inspirationalQuotes = [
    "Take a moment to breathe. You're doing great!",
    "Small breaks lead to big productivity.",
    "Rest is not a waste of time, it's an investment in your focus.",
    "Your mind needs breaks to stay sharp.",
    "Progress isn't just about working hard—it's about working smart.",
    "Remember why you started this journey.",
    "Every moment of rest makes your focus stronger.",
    "You've accomplished so much already today.",
    "Do you know how great you can be?",
    "Your dedication is inspiring. Keep going!",
    "This break is fueling your next burst of productivity.",
    "Growth happens during rest too.",
    "Taking breaks is part of the process, not a deviation from it.",
    "You're building habits that will serve you for a lifetime.",
    "Moments of pause give clarity to your purpose."
  ];
  
  // Function to get a random quote
  const getRandomQuote = useCallback((quotes) => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }, []);
  
  // Function to get plant emoji based on selected plant
  const getPlantEmoji = useCallback((plantType) => {
    switch (plantType) {
      case 'carrot':
        return '🥕';
      case 'tomato':
        return '🍅';
      case 'wheat':
        return '🌾';
      default:
        return '🌱';
    }
  }, []);
  
  // Function to get plant name with proper capitalization
  const getPlantName = useCallback((plantType) => {
    return plantType.charAt(0).toUpperCase() + plantType.slice(1);
  }, []);

  // NEW: Spotify Integration Functions
  const initializeSpotify = useCallback(() => {
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
      
      window.onSpotifyWebPlaybackSDKReady = () => {
        if (spotifyToken) {
          const player = new window.Spotify.Player({
            name: 'PomoHarvest Focus Player',
            getOAuthToken: cb => { cb(spotifyToken); },
            volume: 0.5
          });

          setSpotifyPlayer(player);

          player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
          });

          player.addListener('player_state_changed', (state) => {
            if (state) {
              setCurrentTrack(state.track_window.current_track);
              setIsSpotifyPlaying(!state.paused);
              
              // Set album art as background if available
              if (state.track_window.current_track.album.images[0]) {
                setAlbumArtBackground(state.track_window.current_track.album.images[0].url);
              }
            }
          });

          player.connect();
        }
      };
    }
  }, [spotifyToken]);

  const loginToSpotify = () => {
    const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID || 'your_spotify_client_id';
    const REDIRECT_URI = encodeURIComponent(window.location.origin + '/callback');
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state'
    ];
    
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${CLIENT_ID}&scope=${scopes.join('%20')}&redirect_uri=${REDIRECT_URI}`;
    
    const popup = window.open(authUrl, 'spotify-login', 'width=600,height=600');
    
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        // Check for token in localStorage (set by callback page)
        const token = localStorage.getItem('spotify_access_token');
        if (token) {
          setSpotifyToken(token);
          setShowSpotifyLogin(false);
        }
      }
    }, 1000);
  };

  const toggleSpotifyPlayback = () => {
    if (spotifyPlayer) {
      spotifyPlayer.togglePlay();
    }
  };

  const nextTrack = () => {
    if (spotifyPlayer) {
      spotifyPlayer.nextTrack();
    }
  };

  const previousTrack = () => {
    if (spotifyPlayer) {
      spotifyPlayer.previousTrack();
    }
  };

  const toggleShuffle = () => {
    // This would require additional API calls to Spotify Web API
    console.log('Shuffle toggle - requires Web API integration');
  };

  // Initialize Spotify when token is available
  useEffect(() => {
    if (spotifyToken) {
      initializeSpotify();
    }
  }, [spotifyToken, initializeSpotify]);

  // Check for existing Spotify token on mount
  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setSpotifyToken(token);
    }
  }, []);
  
  // FIXED: Function to deduct Garden XP (withering penalty)
  const deductGardenXP = useCallback((amount = 3) => {
    console.log(`Deducting ${amount} Garden XP from current total`);
    
    // Update localStorage immediately to persist the deduction
    const today = new Date().toISOString().split('T')[0];
    const statsLocal = JSON.parse(localStorage.getItem('pomoStats') || '{}');
    if (!statsLocal[today]) {
      statsLocal[today] = {
        completed: 0,
        totalFocusTime: 0,
        failed: 0,
        growthXP: 0,
        harvestXP: 0,
        witherCount: 0
      };
    }
    
    // Add to wither count in localStorage (this will be subtracted from Garden XP)
    statsLocal[today].witherCount = (statsLocal[today].witherCount || 0) + amount;
    localStorage.setItem('pomoStats', JSON.stringify(statsLocal));
    
    // Also update the wither count state for immediate UI update
    setWitherCount(prev => prev + amount);
    
    console.log(`Successfully added ${amount} to wither count. This will deduct ${amount} Garden XP.`);
  }, []);
  
  // UPDATED: Check if session is active (for navigation protection) - includes both focus and break
  const isSessionActive = useCallback(() => {
    return (isActive || isBreak) && (timeLeft > 0 || breakTimeLeft > 0);
  }, [isActive, isBreak, timeLeft, breakTimeLeft]);
  
  // Handle navigation attempt with destination tracking
  const handleNavigationAttempt = useCallback((destination) => {
    if (isSessionActive()) {
      // Store current timer state but DON'T pause the timers yet
      setTimerStateBeforeQuit({
        isActive,
        isBreak,
        isPaused
      });
      
      // Store intended destination
      setIntendedDestination(destination);
      setShowQuitDialog(true);
      return false;
    }
    return true;
  }, [isSessionActive, isActive, isBreak, isPaused]);
  
  // Navigation protection effect
  useEffect(() => {
    // Intercept all clicks on navigation elements
    const handleClick = (event) => {
      if (isSessionActive()) {
        const target = event.target.closest('a, button');
        if (target) {
          // Check if it's a theme toggle button - exclude from quit protection
          const isThemeButton = target.closest('[data-theme-toggle]') || 
                               target.classList.contains('theme-toggle') ||
                               target.textContent?.includes('🌙') ||
                               target.textContent?.includes('☀️') ||
                               target.textContent?.includes('🌗') ||
                               (target.getAttribute && (
                                 target.getAttribute('aria-label')?.includes('theme') ||
                                 target.getAttribute('title')?.includes('theme') ||
                                 target.getAttribute('aria-label')?.includes('dark') ||
                                 target.getAttribute('aria-label')?.includes('light')
                               ));
          
          // Skip theme buttons - let them work normally
          if (isThemeButton) {
            return;
          }
          
          // Check if it's a navigation link (not the focus page controls)
          const isNavLink = target.closest('nav') || 
                           target.closest('footer') || 
                           target.closest('.logo') ||
                           target.href ||
                           (target.textContent && (
                             target.textContent.includes('Dashboard') ||
                             target.textContent.includes('Garden') ||
                             target.textContent.includes('Settings') ||
                             target.textContent.includes('Profile') ||
                             target.textContent.includes('Home') ||
                             target.textContent.includes('PomoHarvest') ||
                             target.textContent.includes('Statistics') ||
                             target.textContent.includes('About') ||
                             target.textContent.includes('Contact') ||
                             target.textContent.includes('Help')
                           ));
          
          if (isNavLink && !target.closest('.focus-controls') && !target.closest('.spotify-controls')) {
            event.preventDefault();
            event.stopPropagation();
            
            // Determine destination
            let destination = '/dashboard'; // default
            if (target.href) {
              try {
                const url = new URL(target.href);
                destination = url.pathname;
              } catch (e) {
                // If not a valid URL, try to extract path
                destination = target.href;
              }
            } else if (target.textContent) {
              const text = target.textContent.toLowerCase();
              if (text.includes('garden')) destination = '/garden';
              else if (text.includes('settings')) destination = '/settings';
              else if (text.includes('profile')) destination = '/profile';
              else if (text.includes('statistics')) destination = '/statistics';
              else if (text.includes('pomoharvest') || text.includes('home')) destination = '/';
            }
            
            handleNavigationAttempt(destination);
          }
        }
      }
    };
    
    // Add click listener to document
    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [isSessionActive, handleNavigationAttempt]);
  
  // FIXED: Calculate gardener level and XP with proper Garden XP deduction
  useEffect(() => {
    console.log('Recalculating gardener level and XP');
    
    // Load current Harvest XP from localStorage or set default
    const savedStats = JSON.parse(localStorage.getItem('pomoStats') || '{}');
    let totalHarvestXP = 0;
    let totalWitherPenalty = 0;
    
    // Sum up harvest points and wither penalties
    Object.values(savedStats).forEach(day => {
      if (day.harvestXP) totalHarvestXP += day.harvestXP;
      if (day.witherCount) totalWitherPenalty += day.witherCount;
    });
    
    console.log(`Total Harvest XP: ${totalHarvestXP}, Total Wither Penalty: ${totalWitherPenalty}`);
    
    // Calculate Garden XP - 1 Harvest XP = 10 Garden XP, then subtract full wither penalty
    // FIXED: Remove the % 10 - we want to subtract the FULL penalty from Garden XP
    const totalGardenXP = Math.max(0, (totalHarvestXP * 10) - totalWitherPenalty);
    
    // Calculate effective Harvest XP for display (but Garden XP calculation uses the full penalty)
    const effectiveHarvestXP = Math.max(0, totalHarvestXP - Math.floor(totalWitherPenalty / 10));
    
    console.log(`Effective Harvest XP: ${effectiveHarvestXP}, Final Garden XP: ${totalGardenXP}`);
    setHarvestXP(effectiveHarvestXP);
    
    // Calculate level based on Fast Early Growth model
    let level = 1;
    const xpLevels = [0, 10, 25, 45, 70, 100, 135, 175, 220]; // Cumulative XP needed for each level
    
    for (let i = 1; i < xpLevels.length; i++) {
      if (totalGardenXP >= xpLevels[i-1] && totalGardenXP < xpLevels[i]) {
        level = i;
        // Calculate XP needed for next level and percentage
        const currentLevelBaseXP = xpLevels[i-1];
        const nextLevelXP = xpLevels[i];
        const xpNeeded = nextLevelXP - currentLevelBaseXP;
        const xpProgress = totalGardenXP - currentLevelBaseXP;
        const percentage = Math.max(0, (xpProgress / xpNeeded) * 100);
        
        setGardenerLevel(level);
        setXpToNextLevel(nextLevelXP);
        setXpPercentage(percentage);
        break;
      }
    }
    
    // If they're beyond our defined levels, use a higher level
    if (totalGardenXP >= xpLevels[xpLevels.length - 1]) {
      setGardenerLevel(xpLevels.length);
      // For levels beyond our table, we'll continue the pattern
      const lastGapIncrease = 40;
      const levelBeyondTable = Math.floor((totalGardenXP - xpLevels[xpLevels.length - 1]) / (lastGapIncrease + 5)) + xpLevels.length;
      setGardenerLevel(levelBeyondTable);
      
      // Calculate percentage for beyond-table levels
      const baseXP = xpLevels[xpLevels.length - 1] + (levelBeyondTable - xpLevels.length) * (lastGapIncrease + 5);
      const nextLevelXP = baseXP + (lastGapIncrease + 5);
      const percentage = Math.max(0, ((totalGardenXP - baseXP) / (nextLevelXP - baseXP)) * 100);
      
      setXpPercentage(percentage);
      setXpToNextLevel(nextLevelXP);
    }
    
    // Handle cases where Garden XP is negative or zero
    if (totalGardenXP <= 0) {
      setGardenerLevel(1);
      setXpPercentage(0);
      setXpToNextLevel(10);
    }
    
    // Set initial growthXP based on focusCount modulo 4
    const currentGrowthXP = focusCount % 4;
    console.log(`Setting initial Growth XP to ${currentGrowthXP} based on focusCount=${focusCount}`);
    setGrowthXP(currentGrowthXP);
    
    console.log(`Final Garden XP: ${totalGardenXP}, Level: ${level}, Percentage: ${xpPercentage}%`);
    
  }, [harvestXP, witherCount, focusCount]);

  // Update HarvestXP when there's a new harvest (when growth XP reaches EXACTLY 4)
useEffect(() => {
  console.log(`Current Growth XP: ${growthXP}`);
  
  // ONLY convert when growthXP is EXACTLY 4
  if (growthXP === 4) {
    console.log('CONVERTING: Growth XP is EXACTLY 4, adding 1 Harvest XP');
    
    // Explicitly update Harvest XP
    setHarvestXP(prev => {
      const newValue = prev + 1;
      console.log(`Harvest XP increased to ${newValue}`);
      return newValue;
    });
    
    // Reset Growth XP after conversion
    console.log('Resetting Growth XP to 0 after conversion');
    setGrowthXP(0);
    
    // Update localStorage to persist the XP change
    const today = new Date().toISOString().split('T')[0];
    const statsLocal = JSON.parse(localStorage.getItem('pomoStats') || '{}');
    if (!statsLocal[today]) {
      statsLocal[today] = {
        completed: 0,
        totalFocusTime: 0,
        failed: 0,
        growthXP: 0,
        harvestXP: 0,
        witherCount: 0
      };
    }
    statsLocal[today].harvestXP = (statsLocal[today].harvestXP || 0) + 1;
    localStorage.setItem('pomoStats', JSON.stringify(statsLocal));
    
    console.log('Converted EXACTLY 4 Growth XP to 1 Harvest XP (+10 Garden XP)');
  }
}, [growthXP]);
  
  // Generate success message based on plant type and progress
  const generateSuccessMessage = useCallback((plantType, pomodoroCount) => {
    const plantEmoji = getPlantEmoji(plantType);
    const plantName = getPlantName(plantType);
    
    if (pomodoroCount === 4) {
      // Harvest stage messages (4th Pomodoro completed)
      switch (plantType) {
        case 'carrot':
          return `${plantEmoji} ${plantName} has been harvested with dedication. +1 Harvest XP 🌿`;
        case 'tomato':
          return `${plantEmoji} ${plantName} plant ripens with discipline. +1 Harvest XP 🌿`;
        case 'wheat':
          return `${plantEmoji} ${plantName} waves golden in the wind, harvest time! +1 Harvest XP 🌿`;
        default:
          return `${plantEmoji} Plant fully grown and harvested! +1 Harvest XP 🌿`;
      }
    } else {
      // Sprout stage messages (Pomodoros 1-3)
      switch (plantType) {
        case 'carrot':
          return `${plantEmoji} ${plantName} has sprouted with steady focus. +1 Growth XP 🌱`;
        case 'tomato':
          return `${plantEmoji} ${plantName} seedling pushes through the soil. +1 Growth XP 🌱`;
        case 'wheat':
          return `${plantEmoji} ${plantName} is beginning to grow strong. +1 Growth XP 🌱`;
        default:
          return `${plantEmoji} Plant sprouting nicely! +1 Growth XP 🌱`;
      }
    }
  }, [getPlantEmoji, getPlantName]);
  
  // FIXED: Generate wither message - changed to Garden XP
  const generateWitherMessage = useCallback((plantType, reason) => {
    const plantEmoji = getPlantEmoji(plantType);
    const plantName = getPlantName(plantType);
    
    if (reason === 'excessive_breaks') {
      switch (plantType) {
        case 'carrot':
          return `${plantEmoji} ${plantName} has withered from neglect. -3 Garden XP 🥀`;
        case 'tomato':
          return `${plantEmoji} ${plantName} has wilted under pressure. -3 Garden XP 🥀`;
        case 'wheat':
          return `${plantEmoji} ${plantName} has failed to thrive. -3 Garden XP 🥀`;
        default:
          return `${plantEmoji} Plant has withered from neglect. -3 Garden XP 🥀`;
      }
    } else if (reason === 'excessive_pausing') {
      switch (plantType) {
        case 'carrot':
          return `${plantEmoji} ${plantName} has weakened from too much pausing. -3 Garden XP 🥀`;
        case 'tomato':
          return `${plantEmoji} ${plantName} has wilted from excessive interruptions. -3 Garden XP 🥀`;
        case 'wheat':
          return `${plantEmoji} ${plantName} has lost strength from frequent pauses. -3 Garden XP 🥀`;
        default:
          return `${plantEmoji} Plant has weakened from excessive pausing. -3 Garden XP 🥀`;
      }
    } else if (reason === 'quit') {
      return `${plantEmoji} ${plantName} has been abandoned. -10 Garden XP 🥀`;
    } else {
      return `${plantEmoji} ${plantName} has withered. -10 Garden XP 🥀`;
    }
  }, [getPlantEmoji, getPlantName]);
  
  // Initialize quotes on component mount
  useEffect(() => {
    setFocusQuote(getRandomQuote(focusQuotes));
    setInspirationalQuote(getRandomQuote(inspirationalQuotes));
  }, [getRandomQuote]);
  
  // COMPLETELY ISOLATED: Focus quote rotation - NO interaction with main timer
  useEffect(() => {
    // Only run when in focus mode, completely independent of main timer
    if (isActive && !isPaused && !isBreak) {
      
      const startFocusQuoteRotation = () => {
        focusQuoteTimer.current = setTimeout(() => {
          setQuoteOpacity(0);
          setTimeout(() => {
            // INLINE: Get random quote to avoid dependencies
            const randomIndex = Math.floor(Math.random() * focusQuotes.length);
            setFocusQuote(focusQuotes[randomIndex]);
            setQuoteOpacity(1);
            startFocusQuoteRotation(); // Continue rotation
          }, 1000); // 1 second fade
        }, 7000); // 7 seconds
      };
      
      startFocusQuoteRotation();
      
      return () => {
        // ONLY clean up quote timer - NEVER touch main timer
        if (focusQuoteTimer.current) {
          clearTimeout(focusQuoteTimer.current);
          focusQuoteTimer.current = null;
        }
      };
    } else {
      // Clean up quote timer when not in focus mode
      if (focusQuoteTimer.current) {
        clearTimeout(focusQuoteTimer.current);
        focusQuoteTimer.current = null;
      }
    }
  }, [isActive, isPaused, isBreak]); // MINIMAL dependencies
  
  // COMPLETELY ISOLATED: Break quote rotation - NO interaction with main timer
  useEffect(() => {
    if (isBreak) {
      // Clear any existing quote timer
      if (breakQuoteTimer.current) {
        clearTimeout(breakQuoteTimer.current);
        breakQuoteTimer.current = null;
      }
      
      // INLINE: Set initial quote to avoid dependencies
      const initialRandomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
      setInspirationalQuote(inspirationalQuotes[initialRandomIndex]);
      setBreakQuoteOpacity(1);
      
      const startBreakQuoteRotation = () => {
        breakQuoteTimer.current = setTimeout(() => {
          setBreakQuoteOpacity(0); // Fade out
          setTimeout(() => {
            // INLINE: Get random quote to avoid dependencies
            const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
            setInspirationalQuote(inspirationalQuotes[randomIndex]);
            setBreakQuoteOpacity(1); // Fade in
            startBreakQuoteRotation(); // Continue rotation
          }, 1000); // 1 second fade
        }, 7000); // 7 seconds
      };
      
      startBreakQuoteRotation();
      
      // Handle break sound
      if (breakSoundRef.current) {
        breakSoundRef.current.play().catch(e => console.log('Audio play error:', e));
      }
      
      return () => {
        // ONLY clean up quote timer - NEVER touch main timer
        if (breakQuoteTimer.current) {
          clearTimeout(breakQuoteTimer.current);
          breakQuoteTimer.current = null;
        }
        // Clean up sound
        if (breakSoundRef.current) {
          breakSoundRef.current.pause();
          breakSoundRef.current.currentTime = 0;
        }
      };
    } else {
      // Clean up quote timer when not in break mode
      if (breakQuoteTimer.current) {
        clearTimeout(breakQuoteTimer.current);
        breakQuoteTimer.current = null;
      }
    }
  }, [isBreak]); // MINIMAL dependencies
  
  // Add page leave listener
  useEffect(() => {
    if (!pageLeaveListenerAdded.current) {
      const handleBeforeUnload = (e) => {
        if (isSessionActive()) {
          e.preventDefault();
          e.returnValue = 'You have an active focus session. Are you sure you want to leave?';
          return e.returnValue;
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      pageLeaveListenerAdded.current = true;
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isSessionActive]);
  
  // MAIN FOCUS TIMER - COMPLETELY ISOLATED from quote effects
  useEffect(() => {
    if (isActive && !isPaused && !isBreak) {
      console.log('Starting focus timer - ISOLATED');
      
      // Clear any existing timer first
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      
      timer.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            console.log('Focus timer completed!');
            clearInterval(timer.current);
            timer.current = null;
            
            if (focusSettings.breakMinutes > 0) {
              playSound('complete');
              console.log('Focus session completed, transitioning to break');
              
              // Increment focus count but cap at 4
              let newFocusCount = focusCount + 1;
              if (newFocusCount > 4) {
                newFocusCount = 1; // Reset to 1 if we go over 4
              }
              setFocusCount(newFocusCount);
              console.log(`Focus count incremented to ${newFocusCount}`);
              
              // For XP tracking: Increment Growth XP by 1 for each Pomodoro
              setGrowthXP(newFocusCount);
              console.log(`Growth XP set to EXACTLY ${newFocusCount} for Pomodoro ${newFocusCount}/4`);
              
              // INLINE: Generate success message to avoid dependencies
              const plantEmoji = focusSettings.selectedPlant === 'tomato' ? '🍅' : 
                                focusSettings.selectedPlant === 'wheat' ? '🌾' : '🥕';
              const plantName = (focusSettings.selectedPlant || 'carrot').charAt(0).toUpperCase() + 
                               (focusSettings.selectedPlant || 'carrot').slice(1);
              
              let newSuccessMessage;
              if (newFocusCount === 4) {
                // Harvest message (4th Pomodoro completion)
                switch (focusSettings.selectedPlant) {
                  case 'carrot':
                    newSuccessMessage = `${plantEmoji} ${plantName} has been harvested with dedication. +1 Harvest XP 🌿`;
                    break;
                  case 'tomato':
                    newSuccessMessage = `${plantEmoji} ${plantName} plant ripens with discipline. +1 Harvest XP 🌿`;
                    break;
                  case 'wheat':
                    newSuccessMessage = `${plantEmoji} ${plantName} waves golden in the wind, harvest time! +1 Harvest XP 🌿`;
                    break;
                  default:
                    newSuccessMessage = `${plantEmoji} Plant fully grown and harvested! +1 Harvest XP 🌿`;
                }
                setCompletedFullCycle(true);
                console.log('User completed full 4/4 Pomodoro cycle!');
              } else {
                // Sprout message (individual Pomodoro)
                switch (focusSettings.selectedPlant) {
                  case 'carrot':
                    newSuccessMessage = `${plantEmoji} ${plantName} has sprouted with steady focus. +1 Growth XP 🌱`;
                    break;
                  case 'tomato':
                    newSuccessMessage = `${plantEmoji} ${plantName} seedling pushes through the soil. +1 Growth XP 🌱`;
                    break;
                  case 'wheat':
                    newSuccessMessage = `${plantEmoji} ${plantName} is beginning to grow strong. +1 Growth XP 🌱`;
                    break;
                  default:
                    newSuccessMessage = `${plantEmoji} Plant sprouting nicely! +1 Growth XP 🌱`;
                }
              }
              
              setSuccessMessage(newSuccessMessage);
              setShowSuccessMessage(true);
              
              // Set pomodoro completed flag to true
              setPomodoroCompleted(true);
              console.log('Pomodoro marked as completed');
              
              // INLINE: Calculate break time to avoid dependencies
              const breakTime = focusCount % 4 === 0 && focusCount > 0 ? 15 * 60 : (focusSettings.breakMinutes * 60 || 300);
              console.log(`Setting break time to ${breakTime} seconds`);
              
              // CRITICAL: First set the break parameters
              setInitialBreakTime(breakTime);
              setBreakTimeLeft(breakTime);
              
              // Clear any manual break message from automatic breaks
              setManualBreakMessage('');
              
              // CRITICAL: Set break state LAST to trigger the break timer effect
              console.log('Transitioning to BREAK mode with isActive=true');
              setIsBreak(true);
              setIsActive(true); // Ensure we're active for the break
              
              return 0;
            } else {
              completeSession();
              return 0;
            }
          }
          return prevTime - 1;
        });
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      console.log(`Focus timer started with interval ID: ${timer.current}`);
    } else {
      // CRITICAL: Only clear timer if we're not in break mode to avoid interference
      if (timer.current && !isBreak) {
        console.log('Clearing focus timer (not in break mode)');
        clearInterval(timer.current);
        timer.current = null;
      }
    }
    
    return () => {
      // CRITICAL: Only clean up focus timer, and only if not in break mode
      if (timer.current && !isBreak) {
        console.log('Cleaning up focus timer in useEffect cleanup');
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [isActive, isPaused, isBreak, focusSettings.breakMinutes, focusCount, focusSettings.selectedPlant]); // MINIMAL dependencies
  
  // MAIN BREAK TIMER - COMPLETELY ISOLATED from quote effects
  useEffect(() => {
    console.log(`Break timer effect triggered: isBreak=${isBreak}, isActive=${isActive}`);
    
    // Always ensure break is active
    if (isBreak && !isActive) {
      console.log('FIXING: Break is not active but should be!');
      setIsActive(true);
      return; // Exit this effect and it will re-run with isActive=true
    }
    
    if (isBreak && isActive) {
      console.log('Starting break timer - ISOLATED');
      
      // Ensure any existing timer is cleared first
      if (timer.current) {
        console.log('Clearing existing timer before setting new break timer');
        clearInterval(timer.current);
        timer.current = null;
      }
      
      // Create new break timer
      console.log('Setting up new break timer interval');
      timer.current = setInterval(() => {
        setBreakTimeLeft(prevTime => {
          console.log(`Break time remaining: ${prevTime}s`);
          if (prevTime <= 1) {
            console.log('Break timer completed!');
            clearInterval(timer.current);
            timer.current = null;
            
            setIsBreak(false);
            
            // If a pomodoro was completed, reset timer to initial seconds
            if (pomodoroCompleted) {
              console.log('Resetting focus timer because pomodoro was completed');
              setTimeLeft(initialSeconds);
            }
            
            // INLINE: Calculate break time to avoid dependencies
            const newBreakTime = focusCount % 4 === 0 && focusCount > 0 ? 15 * 60 : (focusSettings.breakMinutes * 60 || 300);
            
            // Reset the break time for next time
            setInitialBreakTime(newBreakTime);
            setBreakTimeLeft(newBreakTime);
            setIsActive(true); // Ensure we stay active when returning to focus
            
            // INLINE: Play sound to avoid dependencies
            playSound('start');
            
            // Hide success message after break
            setShowSuccessMessage(false);
            // Clear manual break message
            setManualBreakMessage('');
            
            return newBreakTime;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      console.log(`New break timer interval set with ID: ${timer.current}`);
      
      // Play break sound
      if (breakSoundRef.current) {
        console.log('Attempting to play break sound');
        breakSoundRef.current.play().catch(e => console.log('Audio play error:', e));
      }
    }
    
    // CRITICAL: Cleanup function - only clean up break timer
    return () => {
      if (timer.current && isBreak) {
        console.log('Cleaning up break timer in effect cleanup');
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [isBreak, isActive, initialSeconds, pomodoroCompleted, focusCount, focusSettings.breakMinutes]); // MINIMAL dependencies
  
  // Reset focus and growth XP when returning from break (only after 4th Pomodoro)
  useEffect(() => {
    // This effect specifically handles the transition from break to focus mode
    if (!isBreak && pomodoroCompleted) {
      console.log('Returned from break after completing a Pomodoro');
      
      // If this was the 4th Pomodoro, reset the counters
      if (focusCount === 4 || completedFullCycle) {
        console.log('RESET: This was the 4th Pomodoro or completed full cycle. Resetting counters...');
        setFocusCount(0);
        setGrowthXP(0);
        setCompletedFullCycle(false); // NEW: Reset the full cycle flag
      }
      
      setPomodoroCompleted(false);
    }
  }, [isBreak, pomodoroCompleted, focusCount, completedFullCycle]);
  
  // FIXED: Track document visibility - modified to handle automatic resume
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Only pause if we have an active session (focus or break)
        if (isSessionActive()) {
          console.log('Document hidden - pausing timer and showing warning');
          documentVisibilityPaused.current = true;
          setPauseStartTime(Date.now());
          setIsActive(false); // Pause the timer
          setShowPauseWarning(true); // Show the warning
        }
      }
      // Note: We don't auto-resume when document becomes visible
      // The user must interact with the pause warning dialog
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSessionActive]);
  
  // NEW: Enhanced pause penalty system - continuous penalties for excessive pausing
  useEffect(() => {
    console.log(`Pause penalty check: totalPauseTime=${totalPauseTime}, pauseLimit=${pauseLimit}, hasExceededPauseLimit=${hasExceededPauseLimit}, pausePenaltiesApplied=${pausePenaltiesApplied}`);
    
    // Check if we've exceeded the 5-minute limit for the first time
    if (totalPauseTime > pauseLimit && !hasExceededPauseLimit) {
      console.log('FIRST TIME exceeding pause limit - applying initial -3 Garden XP penalty');
      
      setHasExceededPauseLimit(true);
      setPausePenaltiesApplied(1);
      setSessionFailed(true);
      
      // Apply -3 Garden XP penalty
      deductGardenXP(3);
      
      // Show wither message
      const witherMsg = generateWitherMessage(
        focusSettings.selectedPlant || 'carrot',
        'excessive_pausing'
      );
      setSuccessMessage(witherMsg);
      setShowSuccessMessage(true);
      
      playSound('error');
      alert("Your harvest is wilting due to excessive pauses! (-3 Garden XP)");
    }
  }, [totalPauseTime, pauseLimit, hasExceededPauseLimit, pausePenaltiesApplied, deductGardenXP, generateWitherMessage, focusSettings.selectedPlant, playSound]);
  
  // Calculate projected finish time
  const calculateFinishTime = () => {
    if (timeLeft <= 0) return '00:00';
    
    const currentDate = new Date();
    const finishDate = new Date(currentDate.getTime() + timeLeft * 1000);
    const hours = finishDate.getHours();
    let formattedHours = hours;
    const minutes = finishDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    formattedHours = hours % 12;
    formattedHours = formattedHours ? formattedHours : 12; // the hour '0' should be '12'
    
    return `${formattedHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };
  
  // Format time for display
  const formatTimeDisplay = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  // Calculate the remaining duration in hours
  const getRemainingHours = () => {
    return (timeLeft / 3600).toFixed(1);
  };
  
  // FIXED: Handle pause/resume - only show warning, don't pause immediately
  const togglePause = () => {
    if (isActive) {
      // Only show pause warning, don't pause yet
      if (!hidePauseWarning) {
        setShowPauseWarning(true);
      } else {
        // If warning is hidden, pause immediately
        confirmPause();
      }
    } else {
      // Resume from pause
      console.log('Resuming from pause');
      setIsActive(true);
      
      if (pauseStartTime) {
        const pauseDuration = Math.floor((Date.now() - pauseStartTime) / 1000);
        const newTotalPauseTime = totalPauseTime + pauseDuration;
        console.log(`Pause duration: ${pauseDuration}s, New total pause time: ${newTotalPauseTime}s`);
        
        setTotalPauseTime(newTotalPauseTime);
        
        // NEW: Check if this resume action should trigger additional penalties
        // If they already exceeded the limit and are pausing again, apply additional penalty
        if (hasExceededPauseLimit && pauseDuration > 0) {
          console.log('User resumed after already exceeding pause limit - applying additional -3 Garden XP penalty');
          
          setPausePenaltiesApplied(prev => prev + 1);
          
          // Apply additional -3 Garden XP penalty
          deductGardenXP(3);
          
          // Show additional wither message
          const witherMsg = generateWitherMessage(
            focusSettings.selectedPlant || 'carrot',
            'excessive_pausing'
          );
          setSuccessMessage(witherMsg);
          setShowSuccessMessage(true);
          
          playSound('error');
          alert("Additional pausing continues to weaken your harvest! (-3 Garden XP)");
        }
        
        setPauseStartTime(null);
      }
    }
  };
  
  // NEW: Function to actually confirm and execute pause
  const confirmPause = () => {
    console.log('Confirming pause');
    setIsActive(false);
    setPauseStartTime(Date.now());
    setShowPauseWarning(false);
  };
  
  // Handle break
  const handleBreak = () => {
    if (!isBreak && focusSettings.breakMinutes > 0) {
      setBreakCount(prev => prev + 1);
      if (timeLeft > 0) {
        setShowBreakConfirmation(true);
      } else {
        startBreak();
      }
    }
  };
  
  // Additional effect to ensure break timer AUTO-STARTS
  useEffect(() => {
    // This effect ONLY handles the transition TO break mode
    if (isBreak && breakTimeLeft > 0) {
      console.log('BREAK MODE DETECTED - ENSURING AUTO-START');
      
      // Force active state for break timer
      if (!isActive) {
        console.log('CRITICAL FIX: Break mode requires active state!');
        setIsActive(true);
      }
      
      // Ensure break sound is playing
      if (breakSoundRef.current) {
        breakSoundRef.current.play().catch(e => console.log('Break sound error:', e));
      }
    }
  }, [isBreak, breakTimeLeft, isActive]);
  
  // GLOBAL CLEANUP - ONLY for quote timers, never touch main timer
  useEffect(() => {
    return () => {
      console.log('Global cleanup - ONLY quote timers');
      
      // ONLY clean up quote timers - NEVER touch timer.current
      if (focusQuoteTimer.current) {
        clearTimeout(focusQuoteTimer.current);
        focusQuoteTimer.current = null;
      }
      if (breakQuoteTimer.current) {
        clearTimeout(breakQuoteTimer.current);
        breakQuoteTimer.current = null;
      }
      
      // NOTE: timer.current cleanup is handled by individual timer effects
    };
  }, []);
  
  // Start break - UPDATED to handle continuous penalties
  const startBreak = () => {
    console.log('Starting break manually');
    
    // Clear any existing timer
    if (timer.current) {
      console.log('Clearing existing timer before starting break');
      clearInterval(timer.current);
      timer.current = null;
    }
    
    // Set break parameters first
    setBreakTimeLeft(initialBreakTime);
    setShowBreakConfirmation(false);
    
    // NEW LOGIC: Check for excessive breaks and handle penalties TOGETHER
    if (breakCount >= 5) {
      // DEDUCT -3 Garden XP for every break after the 5th one
      deductGardenXP(3);
      
      // Set all the visual feedback TOGETHER with the deduction
      setExcessiveBreaks(true);
      setShowWitheredMessage(true);
      playSound('error');
      
      // Generate and show wither message
      const witherMsg = generateWitherMessage(
        focusSettings.selectedPlant || 'carrot',
        'excessive_breaks'
      );
      setSuccessMessage(witherMsg);
      setShowSuccessMessage(true);
      
      // Show the alert TOGETHER with the deduction
      alert("Too many breaks! Your plant's growth is weakening.");
    } else {
      setShowWitheredMessage(false);
      // Set manual break message for display on break page
      setManualBreakMessage("Break time! Your harvest is still growing. Keep it up!");
    }
    
    // Play sound
    playSound('pause');
    
    // CRITICAL: Set break state LAST to trigger the break timer effect
    console.log('Setting isBreak=true to trigger break timer effect');
    setIsBreak(true);
    setIsActive(true);
  };
  
  // Cancel break confirmation
  const cancelBreakConfirmation = () => {
    setShowBreakConfirmation(false);
  };
  
  // Handle quit
  const handleQuit = () => {
    setIntendedDestination('/dashboard'); // Default destination for manual quit
    setShowQuitDialog(true);
  };
  
  // NEW: Handle completing a full cycle without penalties - SIMPLIFIED
  const handleCompleteCycle = () => {
    console.log('Complete button clicked - navigating directly to dashboard');
    // Just navigate directly - don't try to save anything complex
    navigate('/dashboard');
  };
  
  // FIXED: Cancel quit dialog and resume timers - DON'T change timer states
  const cancelQuit = () => {
    setShowQuitDialog(false);
    setIntendedDestination(null);
    setTimerStateBeforeQuit(null);
    // Don't change any timer states - they should continue running
  };
  
  // FIXED: Dismiss pause warning with automatic resume for tab switching
  const dismissPauseWarning = (dontShowAgain) => {
    if (dontShowAgain) {
      setHidePauseWarning(true);
    }
    
    if (documentVisibilityPaused.current) {
      // This was caused by tab switching - actually pause the timer
      documentVisibilityPaused.current = false;
      confirmPause(); // Actually pause the timer
    } else {
      // This was a manual pause - actually pause the timer
      confirmPause(); // Actually pause the timer
    }
  };
  
  // FIXED: Cancel pause and resume automatically for tab switching
  const cancelPause = () => {
    console.log('Cancel pause clicked');
    setShowPauseWarning(false);
    
    // Check if this pause was caused by tab switching
    if (documentVisibilityPaused.current) {
      console.log('This was a tab switch pause - automatically resuming timer');
      documentVisibilityPaused.current = false;
      
      // Automatically resume the timer without requiring user to click play
      setIsActive(true);
      
      // Clear pause start time since we're not actually pausing
      if (pauseStartTime) {
        setPauseStartTime(null);
      }
    } else {
      console.log('This was a manual pause attempt - just hide warning');
      // For manual pause attempts, don't change isActive state - timer should keep running
      if (pauseStartTime) {
        setPauseStartTime(null);
      }
    }
  };
  
  // Toggle instructions display
  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };
  
  // Complete a pomodoro session and save progress
  const completeSession = async () => {
    console.log('Completing session and saving progress');
    
    const effectiveFocusTime = elapsedTime - totalPauseTime;
    const isSuccessful = !sessionFailed && !excessiveBreaks && effectiveFocusTime >= (15 * 60);
    
    // Calculate pomodoros completed
    const pomodorosCompleted = isSuccessful ? Math.ceil(effectiveFocusTime / (25 * 60)) : 0;
    console.log(`Pomodoros completed: ${pomodorosCompleted}`);
    
    // Calculate harvests (completed cycles) - CRITICAL: only count whole cycles (4 pomodoros)
    const completedHarvests = isSuccessful ? Math.floor(pomodorosCompleted / 4) : 0; // Only whole cycles
    const remainingGrowthXP = isSuccessful ? pomodorosCompleted % 4 : 0;
    
    console.log(`Completed harvests: ${completedHarvests}, Remaining growth XP: ${remainingGrowthXP}`);
    
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const breakType = focusCount % 4 === 0 && focusCount > 0 ? 'long' : 'short';
        const plant = {
          type: focusSettings.selectedPlant || 'carrot',
          completedAt: new Date().toISOString(),
          pomodoros: pomodorosCompleted,
          focusTime: effectiveFocusTime,
          pauseTime: totalPauseTime,
          status: isSuccessful ? 'success' : 'failed',
          wilted: totalPauseTime > pauseLimit || excessiveBreaks,
          earlyBreak: breakCount > 0,
          excessiveBreaks: excessiveBreaks,
          breakType: isSuccessful && focusSettings.breakMinutes > 0 ? breakType : 'none',
          notes: focusSettings.description || 'Focus session',
          plantStatus: isSuccessful ? 'healthy' : 'wilted', // For garden visualization
          growthXP: isSuccessful ? remainingGrowthXP : 0,
          harvestXP: isSuccessful ? completedHarvests : 0,
          witherCount: sessionFailed || excessiveBreaks ? witherCount : 0,  
          pausePenalties: pausePenaltiesApplied // NEW: Track pause penalties applied
        };
        
        await updateDoc(userRef, {
          plants: arrayUnion(plant),
          focusTimeTotal: increment(effectiveFocusTime),
          pomodorosCompleted: increment(isSuccessful ? plant.pomodoros : 0),
          failedSessions: increment(isSuccessful ? 0 : 1), // Track failed sessions
          growthXPTotal: increment(isSuccessful ? remainingGrowthXP : 0),
          harvestXPTotal: increment(isSuccessful ? completedHarvests : 0),
          witherCountTotal: increment(plant.witherCount),
          pausePenaltiesTotal: increment(pausePenaltiesApplied) // NEW: Track total pause penalties
        });
        
        const today = new Date().toISOString().split('T')[0];
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const stats = userDoc.data().stats || {};
          if (!stats[today]) {
            stats[today] = {
              completed: 0,
              totalFocusTime: 0,
              failed: 0,
              growthXP: 0,
              harvestXP: 0,
              witherCount: 0,
              pausePenalties: 0 // NEW: Track daily pause penalties
            };
          }
          if (isSuccessful) {
            stats[today].completed += plant.pomodoros;
            stats[today].growthXP += remainingGrowthXP;
            stats[today].harvestXP += completedHarvests;
          } else {
            stats[today].failed += 1;
            stats[today].witherCount += witherCount;
          }
          stats[today].totalFocusTime += effectiveFocusTime;
          stats[today].pausePenalties += pausePenaltiesApplied; // NEW: Add pause penalties to daily stats
          await updateDoc(userRef, { stats });
        }
        
        // Save to localStorage
        const statsLocal = JSON.parse(localStorage.getItem('pomoStats') || '{}');
        if (!statsLocal[today]) {
          statsLocal[today] = {
            completed: 0,
            totalFocusTime: 0,
            failed: 0,
            growthXP: 0,
            harvestXP: 0,
            witherCount: 0,
            pausePenalties: 0 // NEW: Track pause penalties in localStorage
          };
        }
        
        if (isSuccessful) {
          statsLocal[today].completed += pomodorosCompleted;
          statsLocal[today].growthXP += remainingGrowthXP;
          statsLocal[today].harvestXP += completedHarvests;
        } else {
          statsLocal[today].failed += 1;
          statsLocal[today].witherCount += witherCount;
        }
        statsLocal[today].totalFocusTime += effectiveFocusTime;
        statsLocal[today].pausePenalties += pausePenaltiesApplied; // NEW: Add pause penalties to localStorage
        
        localStorage.setItem('pomoStats', JSON.stringify(statsLocal));
        
        localStorage.setItem('lastSession', JSON.stringify({
          focusTime: effectiveFocusTime,
          pauseTime: totalPauseTime,
          isSuccessful,
          plantType: focusSettings.selectedPlant || 'carrot',
          sessionType: focusSettings.sessionTypeName,
          description: focusSettings.description,
          completedAt: new Date().toISOString(),
          breakType: isSuccessful && focusSettings.breakMinutes > 0 ? breakType : 'none',
          plantStatus: isSuccessful ? 'healthy' : 'wilted',
          growthXP: isSuccessful ? remainingGrowthXP : 0,
          harvestXP: isSuccessful ? completedHarvests : 0,
          witherCount: sessionFailed || excessiveBreaks ? witherCount : 0,
          pausePenalties: pausePenaltiesApplied // NEW: Track pause penalties in session summary
        }));
        
        navigate('/garden', { 
          state: { 
            sessionCompleted: true,
            sessionSummary: {
              focusTime: effectiveFocusTime,
              pauseTime: totalPauseTime,
              isSuccessful,
              plantType: focusSettings.selectedPlant || 'carrot',
              breakType: isSuccessful && focusSettings.breakMinutes > 0 ? breakType : 'none',
              plantStatus: isSuccessful ? 'healthy' : 'wilted',
              growthXP: isSuccessful ? remainingGrowthXP : 0,
              harvestXP: isSuccessful ? completedHarvests : 0,
              witherCount: sessionFailed || excessiveBreaks ? witherCount : 0,
              pausePenalties: pausePenaltiesApplied // NEW: Include pause penalties in navigation state
            }
          } 
        });
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  };
  
  // UPDATED: Confirm quit and navigate to intended destination with -10 Garden XP penalty
  const confirmQuit = () => {
    // DEDUCT Garden XP when quitting (ensures -10 Garden XP deduction)
    deductGardenXP(10);
    
    const witherMsg = generateWitherMessage(
      focusSettings.selectedPlant || 'carrot',
      'quit'
    );
    
    // Set wither message
    setSuccessMessage(witherMsg);
    setShowSuccessMessage(true);
    
    // Count this as a failed session
    setSessionFailed(true);
    
    const effectiveFocusTime = elapsedTime - totalPauseTime;
    if (effectiveFocusTime >= 300) {
      completeSession();
    }
    
    // Navigate to intended destination or default to dashboard
    const destination = intendedDestination || '/dashboard';
    navigate(destination);
  };
  
  return (
    <Layout>
      <div className="py-8 px-4 relative min-h-screen overflow-hidden">


        {/* ENHANCED: Animated Farm Background with Stars and More Clouds */}
        <div className="fixed inset-0 -z-20 farm-background">
        {/* Sky */}
        <div className="absolute inset-0 sky-gradient"></div>
        
        {/* Stars for Dark Mode */}
        <div className="dark:block hidden absolute inset-0 stars-container">
          {Array.from({ length: 25 }, (_, i) => (
            <div key={i} className="star"></div>
          ))}
        </div>
        
        {/* UPDATED: Flying Birds with Wing Flapping - Both Directions (Light Mode Only) */}
        <div className="dark:hidden block absolute inset-0 birds-container">
          {/* RIGHT-FLYING BIRDS (Left to Right) */}
          <div className="bird-container bird-container-one">
            <div className="bird bird-one"></div>
          </div>
          <div className="bird-container bird-container-two">
            <div className="bird bird-two"></div>
          </div>
          <div className="bird-container bird-container-three">
            <div className="bird bird-three"></div>
          </div>
          <div className="bird-container bird-container-four">
            <div className="bird bird-four"></div>
          </div>
          <div className="bird-container bird-container-five">
            <div className="bird bird-five"></div>
          </div>
          
          {/* NEW: LEFT-FLYING BIRDS (Right to Left) */}
          <div className="bird-container-left bird-container-left-one">
            <div className="bird bird-left-one"></div>
          </div>
          <div className="bird-container-left bird-container-left-two">
            <div className="bird bird-left-two"></div>
          </div>
          <div className="bird-container-left bird-container-left-three">
            <div className="bird bird-left-three"></div>
          </div>
          <div className="bird-container-left bird-container-left-four">
            <div className="bird bird-left-four"></div>
          </div>
        </div>


        
        {/* Clouds */}
        <div className="absolute inset-0">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
          <div className="cloud cloud-4"></div>
          <div className="cloud cloud-5"></div>
          <div className="cloud cloud-6"></div>
        </div>
        
        {/* Sun/Moon */}
        <div className="absolute sun-moon">
          <div className="sun-moon-inner"></div>
        </div>
        


        
        {/* FIXED: Ground with proper positioning */}
        <div className="absolute bottom-0 left-0 right-0 ground-layer">
          {/* Dark brown soil where tractor rakes */}
          <div className="soil-base"></div>
          
          {/* FIXED: Realistic planted crops ON the ground */}
          <div className="field-crops">
            {/* Main crop row - what user is growing */}
            <div className="crop-row-main">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className={`crop-plant ${focusSettings.selectedPlant || 'carrot'}-crop`}></div>
              ))}
            </div>
            
            {/* Background crop rows */}
            <div className="crop-row-back">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={`crop-plant ${['carrot', 'tomato', 'wheat'][i % 3]}-crop`}></div>
              ))}
            </div>
          </div>
          
          {/* Trees on sides */}
          <div className="side-trees">
            <div className="tree tree-left">🌳</div>
            <div className="tree tree-right">🌲</div>
          </div>
          
          {/* FIXED: Working farmers */}
          <div className="farmers-working">
            <div className="farmer farmer-boy">
              <div className="farmer-person">👨‍🌾</div>
              <div className="farmer-basket">🧺</div>
            </div>
            <div className="farmer farmer-girl">
              <div className="farmer-person">👩‍🌾</div>
              <div className="farmer-basket">🪣</div>
            </div>
          </div>
          
          {/* Natural grass */}
          <div className="natural-grass">
            {Array.from({ length: 40 }, (_, i) => (
              <div key={i} className="grass-blade" style={{ left: `${i * 2.5}%` }}></div>
            ))}
          </div>



          
          {/* FIXED: Tractor with rake */}
          <div className="tractor-area">
            {/* BOTTOM TRACTOR - Left to Right start (20s) */}
            <div className="tractor-with-rake">
              <div className="css-tractor">
                {/* Large Front Wheel */}
                <div className="tractor-wheel wheel-large">
                  <div className="wheel-center"></div>
                </div>
                
                {/* Small Rear Wheel */}
                <div className="tractor-wheel wheel-small">
                  <div className="wheel-center"></div>
                </div>
                
                {/* Main Chassis */}
                <div className="tractor-chassis"></div>
                
                {/* Cockpit */}
                <div className="tractor-cockpit"></div>
                
                {/* Exhaust Pipe */}
                <div className="tractor-exhaust"></div>
                
                {/* Engine Gills */}
                <div className="tractor-gills"></div>
                
                {/* Rake Attachment */}
                <div className="rake-attachment"></div>
                
                {/* ENHANCED NIGHT MODE HEADLIGHTS */}
                <div className="headlights">
                  {/* Main Headlight */}
                  <div className="headlight-main"></div>
                  
                  {/* Work Lights */}
                  <div className="work-lights">
                    <div className="work-light"></div>
                    <div className="work-light"></div>
                    <div className="work-light"></div>
                    <div className="work-light"></div>
                  </div>
                  
                  {/* Enhanced Ground Reflection */}
                  <div className="ground-reflection"></div>
                </div>
              </div>
            </div>
            
            {/* MIDDLE TRACTOR - Right to Left start (24s) */}
            <div className="tractor-with-rake-middle">
              <div className="css-tractor">
                {/* Large Front Wheel */}
                <div className="tractor-wheel wheel-large">
                  <div className="wheel-center"></div>
                </div>
                
                {/* Small Rear Wheel */}
                <div className="tractor-wheel wheel-small">
                  <div className="wheel-center"></div>
                </div>
                
                {/* Main Chassis */}
                <div className="tractor-chassis"></div>
                
                {/* Cockpit */}
                <div className="tractor-cockpit"></div>
                
                {/* Exhaust Pipe */}
                <div className="tractor-exhaust"></div>
                
                {/* Engine Gills */}
                <div className="tractor-gills"></div>
                
                {/* Rake Attachment */}
                <div className="rake-attachment"></div>
                
                {/* ENHANCED NIGHT MODE HEADLIGHTS */}
                <div className="headlights">
                  {/* Main Headlight */}
                  <div className="headlight-main"></div>
                  
                  {/* Work Lights */}
                  <div className="work-lights">
                    <div className="work-light"></div>
                    <div className="work-light"></div>
                    <div className="work-light"></div>
                    <div className="work-light"></div>
                  </div>
                  
                  {/* Enhanced Ground Reflection */}
                  <div className="ground-reflection"></div>
                </div>
              </div>
            </div>
            
            {/* TOP TRACTOR - Left to Right start SLOWER (24s) */}
            <div className="tractor-with-rake-top">
              <div className="css-tractor">
                {/* Large Front Wheel */}
                <div className="tractor-wheel wheel-large">
                  <div className="wheel-center"></div>
                </div>
                
                {/* Small Rear Wheel */}
                <div className="tractor-wheel wheel-small">
                  <div className="wheel-center"></div>
                </div>
                
                {/* Main Chassis */}
                <div className="tractor-chassis"></div>
                
                {/* Cockpit */}
                <div className="tractor-cockpit"></div>
                
                {/* Exhaust Pipe */}
                <div className="tractor-exhaust"></div>
                
                {/* Engine Gills */}
                <div className="tractor-gills"></div>
                
                {/* Rake Attachment */}
                <div className="rake-attachment"></div>
                
                {/* ENHANCED NIGHT MODE HEADLIGHTS */}
                <div className="headlights">
                  {/* Main Headlight */}
                  <div className="headlight-main"></div>
                  
                  {/* Work Lights */}
                  <div className="work-lights">
                    <div className="work-light"></div>
                    <div className="work-light"></div>
                    <div className="work-light"></div>
                    <div className="work-light"></div>
                  </div>
                  
                  {/* Enhanced Ground Reflection */}
                  <div className="ground-reflection"></div>
                </div>
              </div>
            </div>
            
            {/* FOURTH TRACTOR - Right to Left start SLOWEST (26s) */}
            <div className="tractor-with-rake-fourth">
              <div className="css-tractor">
                {/* Large Front Wheel */}
                <div className="tractor-wheel wheel-large">
                  <div className="wheel-center"></div>
                </div>
                
                {/* Small Rear Wheel */}
                <div className="tractor-wheel wheel-small">
                  <div className="wheel-center"></div>
                </div>
                
                {/* Main Chassis */}
                <div className="tractor-chassis"></div>
                
                {/* Cockpit */}
                <div className="tractor-cockpit"></div>
                
                {/* Exhaust Pipe */}
                <div className="tractor-exhaust"></div>
                
                {/* Engine Gills */}
                <div className="tractor-gills"></div>
                
                {/* Rake Attachment */}
                <div className="rake-attachment"></div>
                
                {/* ENHANCED NIGHT MODE HEADLIGHTS */}
                <div className="headlights">
                  {/* Main Headlight */}
                  <div className="headlight-main"></div>
                  
                  {/* Work Lights */}
                  <div className="work-lights">
                    <div className="work-light"></div>
                    <div className="work-light"></div>
                    <div className="work-light"></div>
                    <div className="work-light"></div>
                  </div>
                  
                  {/* Enhanced Ground Reflection */}
                  <div className="ground-reflection"></div>
                </div>
              </div>
            </div>
            
            {/* Additional dust clouds for top and fourth tractors */}
            <div className="dust-top"></div>
            <div className="dust-fourth"></div>
            
            {/* Raking Lines on Ground for All Four Tractors */}
            <div className="rake-lines"></div>
          </div>


          
        </div>




      </div>





        {/* Album Art Background Overlay (when Spotify is playing) */}
        {albumArtBackground && (
          <div 
            className="fixed inset-0 -z-10 opacity-20 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${albumArtBackground})` }}
          ></div>
        )}
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <button
            onClick={handleQuit}
            className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 flex items-center focus-controls farm-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Quit
          </button>
          
          <div className="flex items-center space-x-4">


            {/* NEW: Spotify Integration Controls - Updated with smaller spacing */}
              <div className="spotify-controls">
                {!spotifyToken ? (
                  <button
                    onClick={() => setShowSpotifyLogin(true)}
                    className="spotify-button"
                    title="Connect to Spotify"
                  >
                    <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    <span>Spotify</span>
                  </button>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={previousTrack}
                        className="spotify-button"
                        title="Previous Track"
                      >
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={toggleSpotifyPlayback}
                        className="spotify-button"
                        title={isSpotifyPlaying ? "Pause" : "Play"}
                      >
                        {isSpotifyPlaying ? (
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                        ) : (
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </button>
                      
                      <button
                        onClick={nextTrack}
                        className="spotify-button"
                        title="Next Track"
                      >
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"/>
                        </svg>
                      </button>
                    </div>
                    
                    {currentTrack && (
                      <div className="track-info">
                        {currentTrack.name} - {currentTrack.artists[0].name}
                      </div>
                    )}
                  </>
                )}
              </div>
            

            
            <button
              onClick={toggleInstructions}
              className="text-green-700 hover:text-green-800 dark:text-green-300 dark:hover:text-green-200 flex items-center focus-controls farm-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Instructions
            </button>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Current Plant Display */}
          <div className="flex justify-center mb-4">
            <div className="farm-card px-6 py-3 rounded-full text-lg font-medium shadow-sm">
              <span className="mr-2 text-2xl">{getPlantEmoji(focusSettings.selectedPlant)}</span>
              Growing: {getPlantName(focusSettings.selectedPlant)}
            </div>
          </div>
          
          {/* UPDATED: Gardener Level Progress Bar - Changed to PURPLE color with black text */}
          <div className="mb-6 farm-card rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-800 dark:text-gray-200 text-lg">
                Garden XP
              </span>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-400 rounded-full inline-block mr-1"></span>
                  <span className="text-green-700 dark:text-green-400 font-medium">
                    Growth XP = + {growthXP}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-amber-400 rounded-full inline-block mr-1"></span>
                  <span className="harvest-xp-text font-medium">
                    Harvest XP = + {harvestXP}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 relative border border-gray-300 dark:border-gray-600">
              <div 
                className="bg-purple-500 h-4 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${xpPercentage}%` }}
              ></div>
              <div className="absolute left-0 top-0 h-full flex items-center px-3">
                <span className="xp-bar-text text-xs font-semibold drop-shadow-md">
                  Current: {Math.max(0, harvestXP * 10 - witherCount)} XP
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs mt-1 text-gray-700 dark:text-gray-300">
              <span>Level {gardenerLevel}</span>
              <span>Next: Level {gardenerLevel + 1} ({xpToNextLevel} Garden XP)</span>
            </div>
          </div>
          
          {/* UPDATED Instructions Modal */}
          {showInstructions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="farm-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 border border-gray-300 dark:border-gray-600">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">How PomoHarvest Works</h3>
                  <button 
                    onClick={toggleInstructions}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus-controls"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-8">
                  {/* Overview Section */}
                  <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-xl border border-green-300 dark:border-green-700">
                    <h2 className="text-xl font-bold mb-4 text-green-800 dark:text-green-200">🌿 PomoHarvest System Overview</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      PomoHarvest combines the Pomodoro Technique with gamification to help you build focus habits. 
                      Complete focus sessions to grow plants and earn XP. Your consistency determines your Gardener Level!
                    </p>
                  </div>

                  {/* XP System */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="farm-card p-6 rounded-xl shadow-sm border border-green-300 dark:border-green-700">
                      <div className="text-center">
                        <div className="text-4xl mb-3">🌱</div>
                        <h3 className="font-bold text-lg mb-2 text-green-700 dark:text-green-400">Growth XP</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Earned from individual Pomodoros
                        </p>
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="font-medium text-gray-700 dark:text-gray-300">1 Completed Pomodoro = +1 Growth XP</p>
                          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">Progress: 0/4 → 1/4 → 2/4 → 3/4 → Reset</p>
                        </div>
                      </div>
                    </div>

                    <div className="farm-card p-6 rounded-xl shadow-sm border border-amber-300 dark:border-amber-700">
                      <div className="text-center">
                        <div className="text-4xl mb-3">🌿</div>
                        <h3 className="font-bold text-lg mb-2 text-amber-700 dark:text-amber-400">Harvest XP</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Earned from complete cycles
                        </p>
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                          <p className="font-medium text-gray-700 dark:text-gray-300">4 Growth XP = +1 Harvest XP</p>
                          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">Each Harvest XP = 10 Garden XP</p>
                        </div>
                      </div>
                    </div>

                    <div className="farm-card p-6 rounded-xl shadow-sm border border-purple-300 dark:border-purple-700">
                      <div className="text-center">
                        <div className="text-4xl mb-3">🏆</div>
                        <h3 className="font-bold text-lg mb-2 text-purple-700 dark:text-purple-400">Garden XP</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Determines your Gardener Level
                        </p>
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                          <p className="font-medium text-gray-700 dark:text-gray-300">1 Harvest XP = 10 Garden XP</p>
                          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">Used for level progression</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Penalties Section */}
                  <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-xl border border-red-300 dark:border-red-700">
                    <h2 className="text-xl font-bold mb-4 text-red-800 dark:text-red-200 flex items-center">
                      <span className="text-2xl mr-2">🥀</span>
                      Withering Penalties
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="farm-card p-4 rounded-lg border border-red-300 dark:border-red-800">
                        <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Excessive Breaks</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Taking 5+ manual breaks during a session
                        </p>
                        <p className="font-bold text-red-600">-3 Garden XP per break</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Penalty applies to each break after the 5th
                        </p>
                      </div>

                      <div className="farm-card p-4 rounded-lg border border-red-300 dark:border-red-800">
                        <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Excessive Pausing</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Initial penalty at 5+ minutes, then continuous penalties for each additional pause
                        </p>
                        <p className="font-bold text-red-600">-3 Garden XP per penalty</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Continuous penalties for ongoing pause behavior
                        </p>
                      </div>

                      <div className="farm-card p-4 rounded-lg border border-red-300 dark:border-red-800">
                        <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Quitting Early</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Abandoning a focus session before completion  
                        </p>
                        <p className="font-bold text-red-600">-10 Garden XP</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Immediate penalty upon quitting
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Level Progression */}
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-xl border border-blue-300 dark:border-blue-700">
                    <h2 className="text-xl font-bold mb-4 text-blue-800 dark:text-blue-200">📈 Gardener Level Progression</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-blue-300 dark:border-blue-800">
                            <th className="py-3 px-4 text-left font-bold text-gray-700 dark:text-gray-300">Level</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-700 dark:text-gray-300">Garden XP Needed</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-700 dark:text-gray-300">XP Gap</th>
                            <th className="py-3 px-4 text-left font-bold text-gray-700 dark:text-gray-300">Harvest XP Equivalent</th>
                          </tr>
                        </thead>
                        <tbody className="space-y-2">
                          <tr className="border-b border-blue-200 dark:border-blue-900">
                            <td className="py-2 px-4 text-gray-700 dark:text-gray-300">1</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">0</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">-</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">0</td>
                          </tr>
                          <tr className="border-b border-blue-200 dark:border-blue-900">
                            <td className="py-2 px-4 text-gray-700 dark:text-gray-300">2</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">10</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">+10</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">1</td>
                          </tr>
                          <tr className="border-b border-blue-200 dark:border-blue-900">
                            <td className="py-2 px-4 text-gray-700 dark:text-gray-300">3</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">25</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">+15</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">2.5</td>
                          </tr>
                          <tr className="border-b border-blue-200 dark:border-blue-900">
                            <td className="py-2 px-4 text-gray-700 dark:text-gray-300">4</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">45</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">+20</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">4.5</td>
                          </tr>
                          <tr className="border-b border-blue-200 dark:border-blue-900">
                            <td className="py-2 px-4 text-gray-700 dark:text-gray-300">5</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">70</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">+25</td><td className="py-2 px-4 text-gray-700 dark:text-gray-300">7</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tips Section */}
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-6 rounded-xl border border-yellow-300 dark:border-yellow-700">
                    <h2 className="text-xl font-bold mb-4 text-yellow-800 dark:text-yellow-200">💡 Pro Tips</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2">Maximize Growth</h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          <li>• Complete full 4-Pomodoro cycles for maximum XP</li>
                          <li>• Avoid taking breaks until absolutely necessary</li>
                          <li>• Keep pause times under 5 minutes total</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2">Avoid Penalties</h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          <li>• Plan your sessions to avoid interruptions</li>
                          <li>• Use break time wisely - it's for true rest</li>
                          <li>• Commit to completing started sessions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-lg italic text-gray-600 dark:text-gray-400">
                      Consistency grows your garden. One Pomodoro at a time 🌼
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={toggleInstructions}
                    className="btn-primary px-8 py-3 text-lg focus-controls"
                  >
                    Start Growing! 🌱
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="farm-card p-8 mb-8 shadow-lg border border-gray-300 dark:border-gray-600">
            <h1 className={`text-xl font-display font-bold text-center mb-2 text-gray-800 dark:text-gray-200 ${isBreak ? 'break-time-title' : ''}`}>
              {isBreak ? 'Break Time' : 'Focus Time'}
              {!isBreak && (
                <span className="text-sm font-normal ml-2 text-gray-500 dark:text-gray-400">
                  ({formatTimeDisplay(initialSeconds)})
                </span>
              )}
            </h1>
            
            <div className={`text-6xl md:text-7xl font-mono font-bold text-center my-6 ${sessionFailed ? 'text-red-500' : ''} ${isBreak ? 'break-time-timer' : ''}`}>
              <span className={isBreak ? 'text-blue-500' : 'text-primary-500'}>
                {isBreak ? formatTimeDisplay(breakTimeLeft) : formatTimeDisplay(timeLeft)}
              </span>
            </div>
            
            {/* Pomodoro Progress and Finish Time */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex justify-center space-x-8 items-center">
                <div>Pomos: {focusCount}/4</div>
                <div>Finish At: {calculateFinishTime()}</div>
              </div>
            </div>
            
            {sessionFailed && !isBreak && (
              <div className="text-center text-red-500 font-medium mb-4">
                ⚠️ Your harvest is wilting due to excessive pauses! 
                {pausePenaltiesApplied > 0 && (
                  <span className="block text-sm mt-1">
                    Pause penalties applied: {pausePenaltiesApplied} (-{pausePenaltiesApplied * 3} Garden XP)
                  </span>
                )}
              </div>
            )}
            
            {showWitheredMessage && !isBreak && (
              <div className="text-center text-red-500 font-medium mb-4">
                ⚠️ Excessive breaks have weakened your plant's growth.
              </div>
            )}
            
            {showSuccessMessage && (
              <div className={`text-center font-medium mb-4 ${excessiveBreaks || sessionFailed ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                {successMessage}
              </div>
            )}
            
            {/* Manual break message display on break page */}
            {isBreak && manualBreakMessage && (
              <div className="text-center font-medium mb-4 text-green-600 dark:text-green-400">
                {manualBreakMessage}
              </div>
            )}
            
            {isBreak ? (
              <div 
                className="text-center italic text-xl break-time-quote my-6 transition-opacity duration-1000" 
                style={{ opacity: breakQuoteOpacity }}
              >
                "{inspirationalQuote}"
              </div>
            ) : (
              <div 
                className="text-center italic text-gray-600 dark:text-gray-400 transition-opacity duration-1000 my-6" 
                style={{ opacity: quoteOpacity }}
              >
                "{focusQuote}"
              </div>
            )}
            
            {focusSettings.description && !isBreak && (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-600">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Current Focus:</h3>
                <p className="text-gray-700 dark:text-gray-300">{focusSettings.description}</p>
              </div>
            )}
            
            {!isBreak && totalPauseTime > 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                Total pause time: {Math.floor(totalPauseTime / 60)}m {totalPauseTime % 60}s
                {totalPauseTime > 180 && (
                  <span className="text-amber-500 ml-2">
                    ⚠️ {Math.max(0, pauseLimit - totalPauseTime)}s until harvest wilts
                  </span>
                )}
                {pausePenaltiesApplied > 0 && (
                  <span className="block text-red-500 text-xs mt-1">
                    Pause penalties: {pausePenaltiesApplied} (-{pausePenaltiesApplied * 3} Garden XP)
                  </span>
                )}
              </div>
            )}
            
            {isBreak ? (
              <>
                {/* NEW: Congratulation message for completed full cycle */}
                {completedFullCycle && (
                  <div className="text-center mb-6 p-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-300 dark:border-green-700">
                    <div className="text-4xl mb-3">🎉</div>
                    <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                      Congratulations! Full Cycle Complete!
                    </h2>
                    <p className="text-green-700 dark:text-green-300 mb-3">
                      You've successfully completed a full 4/4 Pomodoro cycle! Amazing focus and dedication! 🌟
                    </p>
                    <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      +1 Harvest XP • +10 Garden XP 🌿
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center space-x-4 focus-controls">
                  <button
                    onClick={() => {
                      console.log('Start New Pomo / Return to Focus button clicked');
                      
                      // First clear any existing timer
                      if (timer.current) {
                        console.log('Clearing existing timer before returning to focus');
                        clearInterval(timer.current);
                        timer.current = null;
                      }
                      
                      // Then update states
                      setIsBreak(false);
                      
                      // If this was a completed full cycle, reset everything for a new cycle
                      if (completedFullCycle) {
                        console.log('Starting a new Pomodoro cycle after full completion');
                        setTimeLeft(initialSeconds);
                        setCompletedFullCycle(false);
                        // Reset counters will happen in the effect below
                      } else if (pomodoroCompleted) {
                        console.log('Resetting timer to initial seconds due to completed pomodoro');
                        setTimeLeft(initialSeconds);
                      }
                      
                      // Hide success message when returning to focus
                      setShowSuccessMessage(false);
                      // Clear manual break message
                      setManualBreakMessage('');
                      
                      // Play sound
                      playSound('start');
                      
                      // Set active last to trigger the focus timer effect
                      console.log('Setting active=true to start focus timer');
                      setIsActive(true);
                    }}
                    className="return-focus-button btn-secondary px-6 py-2"
                  >
                    {completedFullCycle ? 'Start a New Pomo' : 'Return to Focus'}
                  </button>
                  
                  {/* NEW: Complete button - only show when full cycle is completed */}
                  {completedFullCycle && (
                    <button
                      onClick={handleCompleteCycle}
                      className="btn-primary px-6 py-2"
                    >
                      Complete
                    </button>
                  )}
                </div>
                
                <audio 
                  ref={breakSoundRef}
                  src="/assets/sounds/calm.mp3" 
                  loop 
                  autoPlay
                />
              </>
            ) : (
              <div className="flex justify-center space-x-4 focus-controls">
                <button
                  onClick={togglePause}
                  className={`aesthetic-button ${isActive ? 'bg-soil-300 hover:bg-soil-400' : 'bg-primary-500 hover:bg-primary-600 text-white'}`}
                >
                  {isActive ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                {!isBreak && focusSettings.breakMinutes > 0 && (
                  <button
                    onClick={handleBreak}
                    className="break-button"
                    title="Take a break"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            )}

          </div>
          
          {/* FIXED: TodoList - Remove conditional rendering and changing key */}
          <TodoList />
        </div>
        
        {/* NEW: Spotify Login Modal */}
        {showSpotifyLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="farm-card rounded-xl max-w-md w-full p-6 border border-gray-300 dark:border-gray-600">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Connect to Spotify</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Connect your Spotify account to play music during your focus sessions. 
                Your album artwork will blend beautifully with the farm background!
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSpotifyLogin(false)}
                  className="btn-outline flex-1 focus-controls"
                >
                  Cancel
                </button>
                
                <button
                  onClick={loginToSpotify}
                  className="btn-primary flex-1 focus-controls flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  <span>Connect Spotify</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showPauseWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="farm-card rounded-xl max-w-md w-full p-6 border border-gray-300 dark:border-gray-600">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Pause Timer</h3>
              <p className="mb-2 text-gray-700 dark:text-gray-300">The pause time will be subtracted from your final focus duration.</p>
              <p className="mb-6 text-amber-600 dark:text-amber-400">⚠️ Pausing for more than 5 minutes will cause your harvest to wilt!</p>
              
              {/* NEW: Show enhanced pause penalty warning */}
              {hasExceededPauseLimit && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                    ⚠️ You've already exceeded the pause limit! Additional pausing will result in more -3 Garden XP penalties.
                  </p>
                  {pausePenaltiesApplied > 0 && (
                    <p className="text-red-500 text-xs mt-1">
                      Current penalties: {pausePenaltiesApplied} (-{pausePenaltiesApplied * 3} Garden XP)
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="dontShowAgain"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  onChange={(e) => setHidePauseWarning(e.target.checked)}
                />
                <label htmlFor="dontShowAgain" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Don't show this again
                </label>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelPause}
                  className="btn-outline flex-1 focus-controls"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => dismissPauseWarning(hidePauseWarning)}
                  className="btn-primary flex-1 focus-controls"
                >
                  Pause
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showBreakConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="farm-card rounded-xl max-w-md w-full p-6 border border-gray-300 dark:border-gray-600">
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Take a Break?</h3>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Taking a break before your focus timer completes is acceptable, but excessive breaks will weaken your {getPlantName(focusSettings.selectedPlant || 'carrot')}'s growth.
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={cancelBreakConfirmation}
                  className="btn-outline flex-1 focus-controls"
                >
                  Continue Focus
                </button>
                
                <button
                  onClick={startBreak}
                  className="take-break-button btn-secondary flex-1 focus-controls"
                >
                  Take Break
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* FIXED QUIT DIALOG - Timers keep running during dialog */}
        {showQuitDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="farm-card rounded-xl max-w-md w-full p-6 border border-gray-300 dark:border-gray-600">
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Are you sure?</h3>
              <p className="mb-6 text-gray-700 dark:text-gray-300">You will destroy this harvest.</p>
              
              <div className="flex space-x-4">
                <button
                  onClick={cancelQuit}
                  className="btn-outline flex-1 focus-controls"
                >
                  Cancel
                </button>
                
                <button
                  onClick={confirmQuit}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex-1 focus-controls"
                >
                  I Quit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FocusPage;