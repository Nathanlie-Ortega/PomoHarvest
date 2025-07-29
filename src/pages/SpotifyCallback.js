import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get the hash from the URL
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const error = params.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      alert('Failed to connect to Spotify');
      navigate('/focus');
    } else if (accessToken) {
      // Store the token in localStorage
      localStorage.setItem('spotify_access_token', accessToken);
      
      // Close the popup window if this is in a popup
      if (window.opener) {
        window.close();
      } else {
        // If not in popup, redirect back to focus page
        navigate('/focus');
      }
    } else {
      console.error('No access token received');
      navigate('/focus');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p>Connecting to Spotify...</p>
      </div>
    </div>
  );
};

export default SpotifyCallback;