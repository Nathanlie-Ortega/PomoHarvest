import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SpotifyCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // First try authorization code flow (from URL params)
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      alert('Failed to connect to Spotify: ' + error);
      navigate('/focus');
      return;
    }

    if (code) {
      // For authorization code flow, you'd need to exchange the code for a token
      // This requires a backend or serverless function
      console.log('Received authorization code:', code);
      alert('Authorization code received, but token exchange not implemented yet');
      navigate('/focus');
      return;
    }

    // Fallback: Try implicit flow (from URL hash)
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const hashError = params.get('error');

      if (hashError) {
        console.error('Spotify auth error:', hashError);
        alert('Failed to connect to Spotify: ' + hashError);
        navigate('/focus');
      } else if (accessToken) {
        // Store the token in localStorage
        localStorage.setItem('spotify_access_token', accessToken);
        console.log('Spotify token stored successfully');
        
        // Close the popup window if this is in a popup
        if (window.opener) {
          window.close();
        } else {
          // If not in popup, redirect back to focus page
          navigate('/focus');
        }
      } else {
        console.error('No access token or code received');
        navigate('/focus');
      }
    } else {
      console.error('No authorization data received');
      navigate('/focus');
    }
  }, [navigate, searchParams]);

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