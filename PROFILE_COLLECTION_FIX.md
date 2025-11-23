# Profile Collection & Update Fix

## Problems Fixed

### 1. **Profile Not Visible in Browser**
- **Issue**: ProfileForm was looking for wrong localStorage keys
- **Fix**: Changed `profileId` → `userId` and `parsedResume` → `profileData`
- **Result**: Profile page now loads data from backend correctly

### 2. **Stuck in profile_collection Loop**
- **Issue**: LLM extraction wasn't reliably extracting `currentLocation` when user said the same city twice
- **Fix**: Made extraction context-aware and targeted
- **Result**: Each question extracts exactly what it's asking for

### 3. **Profile Not Updating in profiles.json**
- **Issue**: Profile was only saved at initialization and job_search stage, not during profile collection
- **Fix**: Save to profiles.json immediately after each field is extracted
- **Result**: Profile updates in real-time as user answers questions

## Implementation Details

### Targeted Extraction

Instead of trying to extract all fields at once, we now extract based on what we're currently asking:

```typescript
if (nextQuestion === 'desired_position') {
  // Extract only desiredPosition
} else if (nextQuestion === 'locations') {
  // Extract only locations array
} else if (nextQuestion === 'current_location') {
  // Extract only currentLocation
}
```

### Immediate Profile Saving

After each successful extraction, we immediately save to `profiles.json`:

```typescript
if (state.userId && (extracted.desiredPosition || extracted.locations || extracted.currentLocation)) {
  const existingProfile = await this.dataStore.getProfile(state.userId).catch(() => null);
  const profileToSave = {
    ...existingProfile,
    id: state.userId,
    // ... merge all fields
    desiredPosition: profile.desiredPosition || existingProfile?.desiredPosition || '',
    locations: profile.locations || existingProfile?.locations || [],
    currentLocation: profile.currentLocation || existingProfile?.currentLocation || '',
    updatedAt: new Date(),
  };
  await this.dataStore.saveProfile(profileToSave);
  logger.info(`Updated profile in profiles.json with new preferences`);
}
```

### Sequential Question Flow

1. **First question**: "What type of position are you looking for?"
   - User: "software engineer"
   - Extract: `desiredPosition: "software engineer"`
   - Save to profiles.json ✓

2. **Second question**: "Where would you like to work?"
   - User: "San Francisco, Remote"
   - Extract: `locations: ["San Francisco", "Remote"]`
   - Save to profiles.json ✓

3. **Third question**: "Where do you currently live?"
   - User: "San Francisco"
   - Extract: `currentLocation: "San Francisco"`
   - Save to profiles.json ✓

4. **Completion**: All fields collected
   - Save final complete profile
   - Move to `job_search` stage ✓

## Enhanced Logging

The backend now logs exactly what's happening at each step:

```
info: Next question to ask: desired_position
info: Extraction response: {"desiredPosition":"software engineer"}
info: ✓ Extracted desiredPosition: software engineer
info: Updated profile in profiles.json with new preferences
info: Profile collection status: position=true, locations=false, currentLocation=false

info: Next question to ask: locations
info: Extraction response: {"locations":["San Francisco","Remote"]}
info: ✓ Extracted locations: ["San Francisco","Remote"]
info: Updated profile in profiles.json with new preferences
info: Profile collection status: position=true, locations=true, currentLocation=false

info: Next question to ask: current_location
info: Extraction response: {"currentLocation":"San Francisco"}
info: ✓ Extracted currentLocation: San Francisco
info: Updated profile in profiles.json with new preferences
info: Profile collection status: position=true, locations=true, currentLocation=true

info: ✓ All profile data collected! Moving to job_search stage
info: ✓ Saved complete profile to profiles.json
```

## Testing

1. Clear old data:
   ```bash
   echo "[]" > backend/data/conversation_states.json
   echo "[]" > backend/data/conversations.json
   ```

2. Upload resume in browser

3. Answer the three questions:
   - "software engineer"
   - "San Francisco, Remote"
   - "San Francisco"

4. Verify in backend logs:
   - ✓ Each extraction logged
   - ✓ Profile saved after each update
   - ✓ Final save before job_search

5. Navigate to `/profile` page:
   - ✓ All resume data displayed
   - ✓ Job preferences filled in

6. Check `backend/data/profiles.json`:
   ```json
   [{
     "id": "user_123",
     "fullName": "John Doe",
     "email": "john@example.com",
     "workExperience": [...],
     "education": [...],
     "skills": [...],
     "desiredPosition": "software engineer",
     "locations": ["San Francisco", "Remote"],
     "currentLocation": "San Francisco",
     "updatedAt": "2025-11-22T23:30:00.000Z"
   }]
   ```

## Files Modified

1. **frontend/src/pages/ProfileForm.tsx**
   - Fixed localStorage key lookups
   - Now uses `userId` instead of `profileId`

2. **backend/src/services/conversation.service.ts**
   - Targeted extraction per question
   - Immediate profile saving after each update
   - Enhanced logging
   - Final profile save before job_search

## Summary

✅ **Profile visible in browser** - ProfileForm loads from backend
✅ **No more loops** - Targeted extraction per question
✅ **Real-time updates** - Profile saved after each answer
✅ **Clear progression** - Logs show exactly what's happening
✅ **Complete data flow** - Resume → Chat → Profile → Job Search

The profile collection workflow now works reliably and provides visibility into every step!
