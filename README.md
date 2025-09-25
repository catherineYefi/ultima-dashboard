# ultima-dashboard
Private dashboard for Ultima participants tracking
# Ultima Dashboard

Private dashboard for tracking Ultima program participants progress across 10 weeks.

## Features

- **Real-time participant tracking** with Firebase
- **Group rankings** based on average scores
- **Individual participant rankings**
- **Admin/Viewer access control**
- **Guest mode** for public viewing
- **Comprehensive scoring system** (tasks, goals, attendance, etc.)
- **Data export** functionality

## Setup

### Prerequisites
- Node.js 14+
- Firebase project with Realtime Database
- Firebase Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ultima-dashboard.git
cd ultima-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Update `firebaseConfig` in `src/App.js` with your Firebase project settings
   - Set up Authentication with Email/Password
   - Configure Realtime Database rules (see below)

4. Start the development server:
```bash
npm start
```

### Firebase Database Rules

```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "participants": {
      ".write": "root.child('admins').child(auth.uid).val() === true"
    },
    "admins": {
      "$uid": {
        ".read": false,
        ".write": "auth != null && $uid === auth.uid"
      }
    }
  }
}
```

### Admin Setup

1. Create a user in Firebase Authentication
2. Add their UID to Realtime Database under `/admins/{uid}: true`
3. The user can now access admin features

## Scoring System

- **Tasks (25pts)**: 5 points per completed task (max 5 tasks)
- **Goals (20pts)**: Based on percentage completion
- **Attendance (15pts)**: Full points for attendance, 0 for absence
- **Chat Reflections (20pts)**: 4 points per reflection (max 5)
- **Artifacts (10pts)**: 10 points for delivery, 0 for non-delivery  
- **Business Metrics (10pts)**: 10 points for positive growth

**Maximum Score**: 100 points

## Access Levels

- **Guest**: View-only access, no authentication required
- **Viewer**: Authenticated users without admin rights
- **Admin**: Full access including data entry and editing

## Deployment

The app can be deployed to:
- **Netlify**: Connect GitHub repo for auto-deployment
- **Vercel**: Import GitHub project
- **CodeSandbox**: Import from GitHub for quick sharing

## Security

- Firebase Authentication handles user management
- Database rules prevent unauthorized writes
- Admin privileges controlled via `/admins` node in database
- Private repository prevents code exposure

## Support

For issues or questions, contact the development team.
