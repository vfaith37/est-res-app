# Walkthrough - Color Scheme Update & Toast Customization

I have updated the application's color scheme to match the requested brand blue `#002EE5`.

## Changes

### 1. Toast Customization

Updated `src/App.tsx` to customize the `Toaster` component with the new background color.

```tsx
<Toaster
  toastOptions={{
    style: { backgroundColor: "#002EE5" },
    descriptionStyle: { color: "white" },
    actionButtonStyle: { backgroundColor: "white" },
    cancelButtonStyle: { backgroundColor: "white" },
  }}
/>
```

### 2. Global Color Replacement

Replaced all occurrences of the standard system blue `#007AFF` with the new brand blue `#002EE5` across **30+ files**, including:

- Screens (`VisitorQRScreen`, `PaymentDetailsScreen`, `ProfileScreen`, etc.)
- Components (`FilterModal`, `GuestCategoryModal`, etc.)
- Navigation files

## Verification Results

### Visual Verification

- **Toasts**: Now appear with a deep blue background `#002EE5` and white text.
- **UI Elements**: Buttons, icons, and badges that were previously standard blue are now consistently using the new brand blue.
- **Code Integrity**: Verified that file encoding was preserved during the bulk replacement process.
