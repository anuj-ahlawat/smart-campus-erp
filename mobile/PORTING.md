# Smart Campus ERP – Web to Mobile Migration Guide

This document explains how to mirror each Next.js route/layout in the Expo React Native app.

## 1. Shared building blocks

- **Auth logic** lives in `src/auth/AuthContext.js`. Reuse it from any screen via `useAuth()`.
- **API helpers**: move the reusable helpers that live under `src/lib` in the Next.js app into a new `mobile/src/lib` folder so both platforms hit the same Express backend contracts.
- **Role metadata**: copy `types/roles.ts` to a JS/TS module the mobile app can import (or expose it from a shared package). This ensures the same `ROLE_REDIRECTS`, nav labels, etc.

## 2. Navigation structure

Use React Navigation stacks/tabs to replicate role layouts:

1. Create a root stack for auth vs. role home (already in `AppNavigator`).
2. For each role, create either:
   - A tab navigator if the web layout uses side navigation (e.g. student dashboard tabs).
   - Nested stacks for drill-down flows (e.g. `student/outpass/:id`).
3. Keep the screen names aligned with the web routes so linking is intuitive: `StudentOutpassScreen`, `AdminUsersScreen`, etc.

Example skeleton for the student area (place under `src/navigation/student.js`):

```js
const StudentTabs = createBottomTabNavigator();

export function StudentNavigator() {
  return (
    <StudentTabs.Navigator>
      <StudentTabs.Screen name="StudentDashboard" component={StudentDashboardScreen} />
      <StudentTabs.Screen name="StudentAttendance" component={StudentAttendanceScreen} />
      <StudentTabs.Screen name="StudentOutpass" component={StudentOutpassScreen} />
      {/* ... */}
    </StudentTabs.Navigator>
  );
}
```

Then mount `<StudentNavigator />` inside the role branch in `AppNavigator`.

## 3. Porting each page

For every Next.js route:

1. **Identify the data hooks/services**. Reuse the same REST endpoints the page currently calls. If the web page uses SWR/React Query, move the fetcher logic into `mobile/src/services/` and keep the same schema.
2. **Recreate the UI** using React Native primitives:
   - Replace Tailwind/HTML with `View`, `Text`, `FlatList`, etc.
   - Use Expo libraries (e.g. `expo-linear-gradient`, `expo-camera`) where the web uses DOM-specific APIs.
3. **Handle loading/error states** similarly to web. You can keep shared components for toasts, skeletons, etc.
4. **Preserve access control** by checking `user.role` inside each screen and redirecting (e.g., `if (user.role !== "student") navigation.replace("Login")`).

## 4. Feature parity checklist

| Web Section | RN Task |
|-------------|---------|
| `/auth/*`   | Build Register, Forgot Password, College Register screens that POST to the same routes. Use React Navigation stack for these public flows. |
| Student dashboard stack | Port dashboard cards, attendance list (`FlatList`), outpass form, timetable, cafeteria screens. |
| Teacher dashboard | Similar pattern; create dedicated Navigator. |
| Admin area | Use Drawer or Tab navigator for Users/Students/Events/Results/Fees. |
| Real-time features | Use `socket.io-client` (Expo-compatible) to subscribe to the same channels for announcements/outpass updates. |
| QR / Scanner flows | Use `expo-camera` or `expo-barcode-scanner` to recreate `/security/scan`, `/cafeteria/scan`. |
| File exports | For CSV downloads, expose backend endpoints and use `expo-file-system` to save/share. |

Track completion role-by-role to ensure nothing is missed.

## 5. Testing

- Use Expo Go / simulators per role to verify navigation + API integration.
- Reuse backend integration tests; only the UI changes.
- Before shipping, run `expo start --clear` to rebuild the JS bundle and run `npx expo-doctor` for env validation.

Following this guide role-by-role will eventually replace every Next.js page with an equivalent mobile experience backed by the same APIs.


