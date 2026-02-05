# Implementation Plan - Toast Notification Integration

The goal is to use a toast system to display API response statuses. We will use `sonner-native` as it is a modern, lightweight, and customizable toast library for React Native.

## User Review Required

> [!IMPORTANT]
> We will be installing `sonner-native`. Please ensure you are okay with adding this dependency.

## Proposed Changes

### Dependencies

#### [NEW] `sonner-native`

- Install `sonner-native` via `npm install sonner-native`.

### App Root

#### [MODIFY] [App.tsx](file:///c:/Users/NETPLUSDOTCOM/Desktop/est-res-app/src/App.tsx)

- Import `Toaster` from `sonner-native`.
- Wrap the app (inside `SafeAreaProvider` or `GestureHandlerRootView`) with `<Toaster />`.

### Store Middleware

#### [NEW] [rtkQueryToastMiddleware.ts](file:///c:/Users/NETPLUSDOTCOM/Desktop/est-res-app/src/store/middleware/rtkQueryToastMiddleware.ts)

- Create a Redux middleware that listens for RTK Query actions.
- On `isRejectedWithValue`: Extract the error message using `getErrorMessage` (from `src/utils/apiHelpers`) and call `toast.error(message)`.
- On `isFulfilled`: functionality for auto-success toasts can be added later or via meta tags, but for now we will rely on manual success toasts for granularity.

#### [MODIFY] [store/index.ts](file:///c:/Users/NETPLUSDOTCOM/Desktop/est-res-app/src/store/index.ts)

- Import and add `rtkQueryErrorLogger` (the middleware) to the store configuration.

### Screens

#### [MODIFY] [VisitorQRScreen.tsx](file:///c:/Users/NETPLUSDOTCOM/Desktop/est-res-app/src/screens/visitors/VisitorQRScreen.tsx)

- Remove `haptics.error()`? Or keep it.
- Remove manual error handling if the middleware covers it (or keep generic handling).
- Add `toast.success("Visitor pass revoked successfully")` in `handleConfirmRevoke`.

## Verification Plan

### Automated Tests

- N/A for UI visual feedback.

### Manual Verification

1.  **Revoke Visitor Success**:
    - Go to Visitor QR Screen.
    - Click "Revoke Pass".
    - Confirm "Yes, revoke".
    - Verify a Green Success Toast appears.
2.  **API Error**:
    - Disconnect network or mock an error.
    - Try to revoke.
    - Verify a Red Error Toast appears automatically via middleware.
