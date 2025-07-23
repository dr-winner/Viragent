// Backend API service for Medium OAuth and token exchange
// This would typically be a separate Node.js/Express server
// For now, this is a reference implementation

const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Medium OAuth callback endpoint
app.post('/api/auth/medium/callback', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;
    
    const tokenResponse = await axios.post('https://api.medium.com/v1/tokens', {
      code,
      client_id: process.env.MEDIUM_CLIENT_ID,
      client_secret: process.env.MEDIUM_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://api.medium.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    res.json({
      access_token,
      refresh_token,
      user: userResponse.data.data
    });

  } catch (error) {
    console.error('Medium OAuth error:', error);
    res.status(400).json({ 
      error: error.message || 'OAuth exchange failed' 
    });
  }
});

// Refresh token endpoint
app.post('/api/auth/medium/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    const response = await axios.post('https://api.medium.com/v1/tokens', {
      refresh_token,
      client_id: process.env.MEDIUM_CLIENT_ID,
      client_secret: process.env.MEDIUM_CLIENT_SECRET,
      grant_type: 'refresh_token'
    });

    res.json(response.data);
  } catch (error) {
    res.status(400).json({ error: 'Token refresh failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Medium API service running on port ${PORT}`);
});
