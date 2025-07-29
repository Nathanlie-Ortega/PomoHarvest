import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SpotifyCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log('SpotifyCallback mounted');
    console.log('Current URL:', window.location.href);
    console.log('Hash:', window.location.hash);
    console.log('Search params:', window.location.search);

    // Check for implicit flow token (in URL hash)
    const hash = window.location.hash.substring(1);
    if (hash) {
      console.log('Found hash:', hash);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const error = params.get('error');
      const tokenType = params.get('token_type');
      const expiresIn = params.get('expires_in');

      if (error) {
        console.error('Spotify auth error:', error);
        alert('Failed to connect to Spotify: ' + error);
        if (window.opener) {
          window.close();
        } else {
          navigate('/focus');
        }
        return;
      }

      if (accessToken) {
        console.log('Access token received:', accessToken.substring(0, 20) + '...');
        console.log('Token type:', tokenType);
        console.log('Expires in:', expiresIn);
        
        // Store the token in localStorage
        localStorage.setItem('spotify_access_token', accessToken);
        
        // Also store expiration time
        if (expiresIn) {
          const expirationTime = Date.now() + (parseInt(expiresIn) * 1000);
          localStorage.setItem('spotify_token_expiration', expirationTime.toString());
        }
        
        console.log('Spotify token stored successfully');
        
        // Close the popup window if this is in a popup
        if (window.opener) {
          console.log('Closing popup window');
          window.close();
        } else {
          // If not in popup, redirect back to focus page
          console.log('Redirecting to focus page');
          navigate('/focus');
        }
        return;
      }
    }

    // Check for authorization code flow (in URL params) - fallback
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      alert('Failed to connect to Spotify: ' + error);
      if (window.opener) {
        window.close();
      } else {
        navigate('/focus');
      }
      return;
    }

    if (code) {
      console.log('Authorization code received (not implemented):', code);
      alert('Authorization code flow not implemented. Please use implicit flow.');
      if (window.opener) {
        window.close();
      } else {
        navigate('/focus');
      }
      return;
    }

    // No token or code found
    console.error('No access token or authorization code found');
    setTimeout(() => {
      if (window.opener) {
        window.close();
      } else {
        navigate('/focus');
      }
    }, 3000);

  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p>Connecting to Spotify...</p>
        <p className="text-sm text-gray-400 mt-2">Please wait while we authorize your account</p>
      </div>
    </div>
  );
};

export default SpotifyCallback;