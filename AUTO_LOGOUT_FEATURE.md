# Auto-Logout Feature

## Overview
Automatic logout functionality that logs users out after 5 minutes of inactivity across all portal types (Client, Admin, and Staff).

## How It Works

### Inactivity Detection
The system monitors user activity through the following events:
- Mouse movements (`mousemove`)
- Mouse clicks (`mousedown`, `click`)
- Keyboard input (`keypress`)
- Touch interactions (`touchstart`)
- Scrolling (`scroll`)

### Timeout Behavior
- **Inactivity Period**: 5 minutes (300 seconds)
- **Warning Time**: 4 minutes (user gets console warning at 4 minutes)
- **Auto-Logout**: At 5 minutes of no activity

### Reset Mechanism
The timer automatically resets whenever the user:
- Moves their mouse
- Clicks anywhere on the page
- Types on the keyboard
- Scrolls the page
- Touches the screen (mobile)

## Implementation

### Hook: `useAutoLogout`
Located at: `/src/hooks/useAutoLogout.ts`

**Parameters:**
```typescript
{
  timeout: number;          // Time in milliseconds (default: 5 minutes)
  logoutEndpoint: string;   // API endpoint to call for logout
  redirectPath: string;     // Path to redirect after logout
  enabled: boolean;         // Whether auto-logout is active
}
```

**Features:**
- Tracks user activity across multiple event types
- Provides 1-minute warning before logout
- Cleans up timers on unmount
- Can be enabled/disabled dynamically

## Portal-Specific Configuration

### 1. Client Portal
**File**: `/src/app/client-portal/layout.tsx`

```typescript
useAutoLogout({
  timeout: 5 * 60 * 1000,                    // 5 minutes
  logoutEndpoint: '/api/client-auth/logout',
  redirectPath: '/client-portal/login',
  enabled: !isAuthPage,                      // Disabled on login page
});
```

**Behavior:**
- Active on all pages except login and forgot-password
- Redirects to `/client-portal/login` after timeout
- Calls `/api/client-auth/logout` before redirect

---

### 2. Admin Portal
**File**: `/src/app/admin/(dashboard)/layout.tsx`

```typescript
useAutoLogout({
  timeout: 5 * 60 * 1000,              // 5 minutes
  logoutEndpoint: '/api/auth/logout',
  redirectPath: '/admin/login',
  enabled: true,
});
```

**Behavior:**
- Active on all admin dashboard pages
- Redirects to `/admin/login` after timeout
- Calls `/api/auth/logout` before redirect

---

### 3. Staff Portal
**File**: `/src/app/staff-portal/layout.tsx`

```typescript
useAutoLogout({
  timeout: 5 * 60 * 1000,                    // 5 minutes
  logoutEndpoint: '/api/staff-auth/logout',
  redirectPath: '/staff-portal/login',
  enabled: !isLoginPage,                     // Disabled on login page
});
```

**Behavior:**
- Active on all pages except login
- Redirects to `/staff-portal/login` after timeout
- Calls `/api/staff-auth/logout` before redirect

---

## User Experience

### Active Session
- User interacts normally with the application
- Timer resets with every interaction
- No interruption to workflow

### Warning Phase (4 minutes)
- Console log appears: "⚠️ You will be logged out in 1 minute due to inactivity"
- User can continue working to prevent logout
- Any activity resets the timer

### Logout Phase (5 minutes)
- Console log appears: "🔒 Logged out due to inactivity"
- Logout API is called
- User is redirected to login page
- Session is cleared on server

---

## Security Benefits

✅ **Session Protection**: Prevents unauthorized access to unattended sessions
✅ **Data Privacy**: Automatically logs out users who leave their workstation
✅ **Compliance**: Helps meet security compliance requirements
✅ **Resource Management**: Frees up server resources from inactive sessions

---

## Customization Options

### Change Timeout Duration

**For all portals (5 minutes → 10 minutes):**
```typescript
timeout: 10 * 60 * 1000  // 10 minutes
```

**For specific roles:**
```typescript
// Shorter timeout for sensitive admin areas
timeout: 3 * 60 * 1000  // 3 minutes for admin

// Longer timeout for staff
timeout: 15 * 60 * 1000  // 15 minutes for staff
```

### Disable for Specific Pages
```typescript
const isSpecialPage = pathname === '/some-page';

useAutoLogout({
  ...config,
  enabled: !isAuthPage && !isSpecialPage,
});
```

### Add Visual Warning Modal
You can enhance the hook to show a modal at 4 minutes:

```typescript
// In useAutoLogout hook
warningTimeoutRef.current = setTimeout(() => {
  // Show modal: "You will be logged out in 1 minute"
  setShowWarningModal(true);
}, timeout - 60 * 1000);
```

---

## Testing

### Manual Testing
1. **Login** to any portal
2. **Wait** without interacting (5 minutes)
3. **Verify** automatic logout occurs
4. **Verify** redirect to login page

### Activity Testing
1. **Login** to any portal
2. **Wait** 4 minutes
3. **Move mouse** or scroll
4. **Wait** another 4 minutes
5. **Verify** timer reset and no logout yet

### Multi-Tab Testing
- Each tab has its own timer
- Logout in one tab requires re-login in all tabs
- Closing a tab clears its timer

---

## Browser Compatibility

✅ **Desktop Browsers:**
- Chrome/Edge
- Firefox
- Safari

✅ **Mobile Browsers:**
- Chrome Mobile
- Safari iOS
- Samsung Internet

✅ **Events Supported:**
- Mouse events (desktop)
- Touch events (mobile)
- Keyboard events (all)
- Scroll events (all)

---

## Technical Notes

### Event Listener Cleanup
- All event listeners are removed on component unmount
- Timers are cleared to prevent memory leaks
- No performance impact on page navigation

### Server-Side Validation
- Client-side logout calls server endpoint
- Server invalidates session/cookie
- Prevents stale sessions on server

### Timer Precision
- JavaScript timers are not perfectly precise
- Actual timeout may vary by ±1 second
- User activity detection is immediate

---

## Future Enhancements (Optional)

1. **Visual Warning Modal**
   - Show countdown modal at 1 minute warning
   - "Keep me logged in" button to extend session

2. **Configurable per User**
   - Admin can set custom timeout per user role
   - Store preference in database

3. **Activity Analytics**
   - Track average session duration
   - Identify optimal timeout periods

4. **Grace Period**
   - Allow user to recover session within 30 seconds
   - Show "Session expired, click to continue"

5. **Cross-Tab Synchronization**
   - Share activity across browser tabs
   - Logout all tabs simultaneously

---

## Troubleshooting

### Issue: Auto-logout not working
**Solution:** Check browser console for errors, verify event listeners are attached

### Issue: Logout too fast/slow
**Solution:** Adjust `timeout` value in layout file

### Issue: Works on desktop but not mobile
**Solution:** Verify `touchstart` events are included in the hook

### Issue: User stays logged in after 5 minutes
**Solution:** Check if page has enabled=false or user is on excluded page

---

## Code Files Modified

1. `/src/hooks/useAutoLogout.ts` - New hook
2. `/src/app/client-portal/layout.tsx` - Added client auto-logout
3. `/src/app/admin/(dashboard)/layout.tsx` - Added admin auto-logout
4. `/src/app/staff-portal/layout.tsx` - Added staff auto-logout

---

## Summary

✅ **Implemented** auto-logout for all portal types
✅ **5 minute** inactivity timeout
✅ **1 minute** warning before logout
✅ **Activity-based** timer reset
✅ **Secure** session cleanup
✅ **Mobile-friendly** touch event support

**Status: COMPLETE** ✨
