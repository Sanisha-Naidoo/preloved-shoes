
/**
 * Utility functions for logging submission steps with timestamps
 */

export const logStep = (step: string, data?: any) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] ${step}:`, data);
  } else {
    console.log(`[${timestamp}] ${step}`);
  }
};
