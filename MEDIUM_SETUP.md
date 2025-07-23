# Medium Integration Setup Guide

This guide will help you set up Medium integration for your Viragent platform.

## 1. Create a Medium Application

1. Visit [Medium Developer Applications](https://medium.com/me/applications)
2. Click "Create Application"
3. Fill in the application details:
   - **Application Name**: Viragent
   - **Description**: AI-powered social media management platform
   - **URL**: Your app URL (e.g., `http://localhost:5173` for development)
   - **Callback URL**: `http://localhost:5173/auth/medium/callback`

4. Note down your **Client ID** and **Client Secret**

## 2. Environment Configuration

Create a `.env` file in your project root with the Medium credentials:

```bash
# Medium API Configuration
VITE_MEDIUM_CLIENT_ID=your_medium_client_id_here
MEDIUM_CLIENT_SECRET=your_medium_client_secret_here
VITE_MEDIUM_REDIRECT_URI=http://localhost:5173/auth/medium/callback
```

## 3. Medium API Features

Your Viragent integration supports:

### Publishing Articles
- Create and publish articles directly to Medium
- Support for draft, public, and unlisted posts
- HTML content formatting
- Tags support (up to 5 tags per article)

### Authentication
- OAuth2 flow for secure authentication
- Access token management
- User profile information

## 4. Backend Functions

The following functions are available in your Motoko backend:

```motoko
// Test Medium posting
public shared func testMediumPost(title: Text, content: Text, accessToken: Text, publishStatus: Text): async Text

// Schedule Medium posts
public shared func scheduleMediumPost(title: Text, content: Text, scheduledAt: Int, accessToken: Text): async Text
```

## 5. Frontend Components

### MediumLogin Component
- Handles Medium OAuth2 authentication
- User-friendly interface with clear instructions
- Error handling for common issues

### MediumCallback Component  
- Processes OAuth2 callback
- Exchanges authorization code for access token
- Stores user credentials securely

### MediumPost Component
- Rich article creation interface
- Title and content editing
- Tag management
- Publish status selection (draft/public/unlisted)

## 6. API Endpoints

Your backend should implement these endpoints:

```javascript
POST /api/auth/medium/callback
- Exchange authorization code for access token
- Return user information

POST /api/auth/medium/refresh  
- Refresh expired access tokens
```

## 7. Usage Flow

1. **Connect Account**: User clicks "Connect to Medium" 
2. **OAuth Flow**: Redirected to Medium for authorization
3. **Callback**: Return to app with authorization code
4. **Token Exchange**: Backend exchanges code for access token
5. **Store Credentials**: Tokens saved for future use
6. **Create Articles**: User can now publish to Medium

## 8. Medium API Limitations

- **Rate Limits**: 1000 requests per hour per user
- **Content Format**: HTML formatting supported
- **Tags**: Maximum 5 tags per post
- **Publishing**: Can create drafts, public, or unlisted posts

## 9. Testing

Use the Candid UI to test Medium integration:

1. Deploy your canisters: `dfx deploy`
2. Open Candid UI
3. Call `testMediumPost` with:
   - title: "Test Article"
   - content: "<p>This is a test article from Viragent!</p>"
   - accessToken: "your_medium_access_token"
   - publishStatus: "draft"

## 10. Production Considerations

### Security
- Store client secrets securely (never in frontend)
- Use HTTPS for all API calls
- Implement token refresh logic
- Validate all user inputs

### Error Handling
- Handle API rate limits
- Manage token expiration
- Provide user feedback for failures
- Log errors for debugging

### Monitoring
- Track publishing success/failure rates
- Monitor API usage against limits
- Set up alerts for authentication issues

## 11. Troubleshooting

### Common Issues

**"Client ID not configured"**
- Check your `.env` file has `VITE_MEDIUM_CLIENT_ID`
- Restart your development server after adding environment variables

**"Invalid redirect URI"**
- Ensure callback URL in Medium app matches your environment
- For development: `http://localhost:5173/auth/medium/callback`
- For production: `https://yourdomain.com/auth/medium/callback`

**"Authorization failed"**
- Check client secret is correct
- Verify OAuth flow parameters
- Ensure proper scopes: `basicProfile,publishPost`

### API Errors

**401 Unauthorized**
- Access token expired or invalid
- Implement token refresh logic

**403 Forbidden**  
- Insufficient permissions
- Check OAuth scopes

**429 Too Many Requests**
- Hit rate limit (1000/hour)
- Implement retry with backoff

## 12. Next Steps

After setting up Medium integration:

1. **Test thoroughly** with different content types
2. **Implement scheduling** for optimal publishing times  
3. **Add analytics** to track article performance
4. **Create templates** for common article formats
5. **Integrate with AI** for content generation

## Support

For Medium API support:
- [Medium API Documentation](https://github.com/Medium/medium-api-docs)
- [Medium Help Center](https://help.medium.com/)

For Viragent integration issues:
- Check the backend logs
- Verify environment variables
- Test API endpoints manually
