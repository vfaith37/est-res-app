import { isRejectedWithValue, Middleware, isFulfilled } from "@reduxjs/toolkit";
import { toast } from "sonner-native";
import { getErrorMessage } from "@/utils/apiHelpers";

/**
 * Log a warning and show a toast!
 */
export const rtkQueryToastMiddleware: Middleware =
  (api) => (next) => (action) => {
    // RTK Query uses `isRejectedWithValue` matcher
    if (isRejectedWithValue(action)) {
      const errorMsg = getErrorMessage(action.payload);
      toast.error(errorMsg);
    }

    return next(action);
  };

