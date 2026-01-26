# Riddt Mobile App

A React Native mobile application for Riddt - a Reddit-style community platform. This mobile app connects to the existing backend API and PostgreSQL database used by the web version.

## Features

- 🔐 **Authentication**: Login and registration with session-based authentication
- 🏠 **Home Feed**: Browse posts with Hot, New, and Top sorting options
- 📝 **Create Posts**: Create new posts with title, content, images, and tags
- 💬 **Comments**: Threaded comment system with nested replies
- ⬆️ **Voting**: Upvote and downvote posts and comments
- 🏷️ **Tags**: Tag posts for better organization
- 👥 **Subreddits**: Browse and create communities
- 📱 **Subscriptions**: Subscribe to your favorite communities
- 🏆 **Badges**: View user badges and achievements
- 👤 **Profiles**: View user profiles with karma and activity
- 🎨 **Theming**: Light/Dark mode support
- 🔄 **Pull to Refresh**: Refresh content with pull gesture

## Tech Stack

- **React Native** with **Expo**
- **React Navigation** for navigation (Stack, Tab, Drawer)
- **TanStack Query** (React Query) for data fetching and caching
- **Zustand** for state management
- **Axios** for API communication
- **Expo SecureStore** for secure token storage
- **TypeScript** for type safety

## Project Structure

```
/mobile
├── src/
│   ├── api/           # API client and endpoint functions
│   ├── components/    # Reusable UI components
│   │   ├── ui/        # Base UI components (Button, Card, etc.)
│   │   ├── posts/     # Post-related components
│   │   ├── comments/  # Comment-related components
│   │   └── layout/    # Layout components (Header, etc.)
│   ├── hooks/         # Custom React hooks
│   ├── navigation/    # Navigation configuration
│   ├── screens/       # Screen components
│   │   └── auth/      # Authentication screens
│   ├── store/         # Zustand stores
│   ├── theme/         # Theme configuration
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── App.tsx        # Root component
├── assets/            # Static assets (icons, images)
├── app.json           # Expo configuration
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript configuration
└── babel.config.js    # Babel configuration
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Studio with emulator
- Expo Go app for physical device testing

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd Riddt/mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API URL**:
   
   Create a `.env` file in the mobile directory:
   ```env
   EXPO_PUBLIC_API_URL=http://your-backend-url:5000
   ```
   
   For local development, use:
   - iOS Simulator: `http://localhost:5000`
   - Android Emulator: `http://10.0.2.2:5000`
   - Physical device: Use your computer's local IP address

4. **Start the development server**:
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on device/simulator**:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## Scripts

```bash
# Start development server
npm start

# Start for iOS
npm run ios

# Start for Android
npm run android

# Start for web
npm run web

# Run linting
npm run lint

# Run tests
npm run test
```

## API Connection

The mobile app connects to the same backend API as the web version. All endpoints are prefixed with `/api`:

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/user` - Get current authenticated user

### Subreddits
- `GET /api/subreddits` - Get all subreddits
- `GET /api/subreddits/:name` - Get subreddit by name
- `POST /api/subreddits` - Create new subreddit

### Posts
- `GET /api/posts` - Get all posts (optional query: ?subreddit=X)
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Comments
- `GET /api/posts/:postId/comments` - Get comments for post
- `POST /api/posts/:postId/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Votes
- `POST /api/votes` - Create or update vote

### Subscriptions
- `POST /api/subscriptions` - Subscribe to subreddit
- `DELETE /api/subscriptions/:subredditId` - Unsubscribe

### Users
- `GET /api/users/:username` - Get user profile
- `GET /api/users/:username/badges` - Get user badges

## Theme

The app follows the same design system as the web version:

### Colors
- Primary: `#6C5CE7` (Purple)
- Upvote: `#FF4500` (Orange-red)
- Downvote: `#7193FF` (Blue)
- Success: `#22C55E` (Green)
- Destructive: `#EF4444` (Red)

### Typography
- Heading sizes: 24px, 20px, 18px, 16px
- Body text: 14px, 15px
- Small text: 12px, 13px

### Border Radius
- Large: 12px
- Medium: 8px
- Small: 6px
- Full (avatars): 9999px

## State Management

### Auth Store (Zustand)
Manages authentication state including:
- Current user
- Loading state
- Authentication status
- Login/Logout/Register actions

### Theme Store (Zustand)
Manages theme preferences:
- Light/Dark/System mode
- Active color scheme
- Theme toggle

## Adding New Screens

1. Create the screen component in `src/screens/`
2. Add the screen type to `RootStackParamList` in `src/types/index.ts`
3. Register the screen in the appropriate navigator in `src/navigation/`

## Adding New API Endpoints

1. Create the API function in `src/api/`
2. Export from `src/api/index.ts`
3. Create a custom hook in `src/hooks/` if needed
4. Export from `src/hooks/index.ts`

## Troubleshooting

### Common Issues

1. **Network request failed**
   - Check that your API URL is correctly configured
   - For Android emulator, use `10.0.2.2` instead of `localhost`
   - Ensure the backend server is running

2. **Authentication not persisting**
   - Check that SecureStore is properly configured
   - Verify session cookies are being sent with requests

3. **Styles not applying**
   - Check that the theme store is initialized
   - Verify component is using theme colors correctly

### Debugging

- Use React Native Debugger for debugging
- Enable network inspection in Expo Dev Tools
- Check console logs for API errors

## Contributing

1. Follow the existing code style
2. Add types for new features
3. Test on both iOS and Android
4. Update README for new features

## License

MIT License - See main project README for details.
