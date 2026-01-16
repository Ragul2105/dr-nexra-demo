# Digital Ocean Deployment Guide

## Quick Fix for Current Error

Your app is failing health checks because:
1. Running `npm run dev` (development mode) instead of production build
2. App runs on port 3000, but Digital Ocean expects port 8080

## Deploy to Digital Ocean App Platform

### Option 1: Using Digital Ocean Dashboard

1. **Go to Digital Ocean App Platform**
   - Navigate to Apps → Create App
   - Connect your GitHub repository

2. **Configure Build & Run Commands**
   ```
   Build Command: npm run build
   Run Command: npm start
   ```

3. **Set Environment Variables**
   - Add `VITE_GEMINI_API_KEY` in the Environment Variables section
   - Value: `AIzaSyDz1uySs_qPZZPyqIOsNBC7JSEMa5k_3Tw`

4. **Configure HTTP Port**
   - Set HTTP Port to: `8080`

5. **Health Check Settings**
   - Path: `/`
   - Initial Delay: 20 seconds
   - Timeout: 5 seconds

### Option 2: Using App Spec File

Upload the `.do/app.yaml` file in your repository root:

1. Update the GitHub repo URL in `.do/app.yaml`
2. In Digital Ocean dashboard, choose "Import from App Spec"
3. Upload or paste the contents of `.do/app.yaml`
4. Add your `VITE_GEMINI_API_KEY` as a secret environment variable

## Firebase Setup in Production

Make sure Firestore is enabled:
1. Go to [Firebase Console](https://console.firebase.google.com/project/dr-website-c6487/firestore)
2. Enable Firestore Database if not already enabled
3. Set security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Patient data
    match /users/{userId}/patients/{patientId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Local Testing of Production Build

Test the production build locally before deploying:

```bash
# Build the app
npm run build

# Serve the production build
npm start

# Open http://localhost:8080
```

## Troubleshooting

### Health Check Failures
- Ensure `npm start` runs successfully locally first
- Check that port 8080 is configured correctly
- Verify environment variables are set

### Build Failures
- Run `npm run build` locally to check for errors
- Ensure all dependencies are in `package.json`
- Check TypeScript errors with `npm run build`

### Firebase Connection Issues
- Verify Firebase config is correct in `config/firebase.ts`
- Check that Firebase project allows your domain
- Add your deployment URL to Firebase authorized domains

## Required Files

- ✅ `package.json` - Updated with `start` script
- ✅ `.do/app.yaml` - Digital Ocean app specification
- ✅ `vite.config.ts` - Configured for production builds
- ✅ `.env.local` - Environment variables (don't commit this!)

## Next Steps

1. Commit these changes to your repository
2. Push to GitHub
3. Deploy using one of the options above
4. Monitor the deployment logs
5. Once deployed, test all features (login, add patient, upload scan)
