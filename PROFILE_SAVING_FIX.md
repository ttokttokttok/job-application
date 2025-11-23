# Profile Saving - Fix Explanation

## The Problem

When we redesigned the workflow to skip the profile form and go directly to the dashboard, we **forgot to save the parsed resume data to `profiles.json`**.

The data was only being stored in:
- ❌ `localStorage` (frontend only, not persistent)
- ❌ `conversation_states.json` (temporary conversation state)
- ❌ NOT in `profiles.json` (where it should be!)

This caused issues when the job search tried to load the profile:
```typescript
// This would fail!
const profile = await dataStore.getProfile(userId);
// Error: Profile not found
```

## The Solution

We now save the profile **three times** at different stages:

### 1. Initial Save (Resume Upload)
**When:** User uploads resume and conversation is initialized
**Where:** `POST /api/agent/initialize`
**What:** Save parsed resume data to `profiles.json`

```typescript
// agent.routes.ts - /initialize endpoint
if (profileData) {
  const profile = {
    id: userId,
    fullName: profileData.fullName || '',
    email: profileData.email || '',
    phone: profileData.phone || '',
    workExperience: profileData.workExperience || [],
    education: profileData.education || [],
    skills: profileData.skills || [],
    desiredPosition: '', // Will be filled in conversation
    locations: [],       // Will be filled in conversation
    currentLocation: '', // Will be filled in conversation
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await dataStore.saveProfile(profile);
}
```

**Result:** Profile saved to `profiles.json` with basic info from resume

### 2. Update Save (Job Preferences Complete)
**When:** User completes profile collection via chat
**Where:** `ConversationService.handleJobSearch()`
**What:** Update profile with job preferences (position, locations, current location)

```typescript
// conversation.service.ts - handleJobSearch
const profile = state.profileData as UserProfile;
profile.id = state.userId;

// Load existing profile to preserve createdAt
let existingProfile;
try {
  existingProfile = await this.dataStore.getProfile(state.userId);
} catch (e) {
  // Profile doesn't exist yet
}

if (existingProfile) {
  profile.createdAt = existingProfile.createdAt; // Preserve original
} else {
  profile.createdAt = new Date();
}
profile.updatedAt = new Date();

await this.dataStore.saveProfile(profile);
```

**Result:** Profile updated in `profiles.json` with complete information

### 3. Ongoing Updates
**When:** User manually edits profile via `/profile` page
**Where:** `PATCH /api/profile/:id`
**What:** Update any field in the profile

```typescript
// profile.routes.ts
router.patch('/:id', async (req, res) => {
  const updated = await dataStore.updateProfile(req.params.id, req.body);
  res.json({ success: true, profile: updated });
});
```

## Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User Uploads Resume                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Resume Parser (Claude)                                      │
│ Extracts: fullName, email, phone, workExperience,          │
│           education, skills                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ POST /api/agent/initialize                                  │
│ ✅ SAVES to profiles.json:                                  │
│    {                                                        │
│      id: "user_123",                                        │
│      fullName: "John Doe",                                  │
│      email: "john@example.com",                             │
│      phone: "+1234567890",                                  │
│      workExperience: [...],                                 │
│      education: [...],                                      │
│      skills: ["Python", "React"],                           │
│      desiredPosition: "",      ← Empty, to be filled        │
│      locations: [],            ← Empty, to be filled        │
│      currentLocation: "",      ← Empty, to be filled        │
│      createdAt: Date,                                       │
│      updatedAt: Date                                        │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Conversation Service                                        │
│ Also saves to conversation_states.json:                     │
│   {                                                         │
│     userId: "user_123",                                     │
│     stage: "profile_collection",                            │
│     profileData: { same data as above },                    │
│     lastUpdated: Date                                       │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ User Chats - Provides Job Preferences                      │
│ "software engineer"                                         │
│ "San Francisco, Remote"                                     │
│ "San Francisco"                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ ConversationService.handleJobSearch()                       │
│ ✅ UPDATES profiles.json:                                   │
│    {                                                        │
│      id: "user_123",                                        │
│      fullName: "John Doe",                                  │
│      email: "john@example.com",                             │
│      phone: "+1234567890",                                  │
│      workExperience: [...],                                 │
│      education: [...],                                      │
│      skills: ["Python", "React"],                           │
│      desiredPosition: "software engineer", ← NOW FILLED     │
│      locations: ["SF", "Remote"],          ← NOW FILLED     │
│      currentLocation: "San Francisco",     ← NOW FILLED     │
│      createdAt: Date,          ← PRESERVED from step 1      │
│      updatedAt: new Date()     ← UPDATED                    │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ JobApplicationService.searchAndApply(userId)                │
│ ✅ CAN NOW LOAD PROFILE:                                    │
│    const profile = await dataStore.getProfile(userId);     │
│    // SUCCESS! Profile exists in profiles.json             │
└─────────────────────────────────────────────────────────────┘
```

## Why Two Storage Locations?

### `profiles.json`
- **Purpose:** Permanent user profile storage
- **Used by:** Job search, application submission, cover letter generation
- **Contents:** Complete user profile with all fields
- **Lifecycle:** Created on resume upload, updated when preferences collected

### `conversation_states.json`
- **Purpose:** Track conversation progress and temporary state
- **Used by:** Conversation service to know what stage user is at
- **Contents:** Current stage, temporary data, selected jobs, drafts
- **Lifecycle:** Created on conversation init, updated with each message, can be cleared

## Testing

You can verify the profile is being saved by checking:

```bash
# After uploading resume
cat backend/data/profiles.json

# You should see:
[
  {
    "id": "user_1763853258687",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "workExperience": [...],
    "education": [...],
    "skills": [...],
    "desiredPosition": "",
    "locations": [],
    "currentLocation": "",
    "createdAt": "2025-11-22T23:14:18.000Z",
    "updatedAt": "2025-11-22T23:14:18.000Z"
  }
]

# After completing job preferences
cat backend/data/profiles.json

# You should see the same profile with filled preferences:
[
  {
    "id": "user_1763853258687",
    ...
    "desiredPosition": "software engineer",
    "locations": ["San Francisco", "Remote"],
    "currentLocation": "San Francisco",
    "createdAt": "2025-11-22T23:14:18.000Z", // SAME as before
    "updatedAt": "2025-11-22T23:20:45.000Z"  // UPDATED
  }
]
```

## Summary

✅ **Fixed:** Profile is now saved to `profiles.json` on resume upload
✅ **Fixed:** Profile is updated with job preferences before job search
✅ **Fixed:** `createdAt` timestamp is preserved across updates
✅ **Working:** Job search can now successfully load the profile
✅ **Working:** All services that need profile data can access it

The profile now flows correctly through the entire system! 🎉
