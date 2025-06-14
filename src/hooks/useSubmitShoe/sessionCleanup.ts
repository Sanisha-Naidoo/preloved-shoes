
import { logStep } from "./submissionLogger";

export const clearSessionData = () => {
  logStep("Clearing session storage after successful submission");
  sessionStorage.removeItem("shoeDetails");
  sessionStorage.removeItem("solePhoto");
  sessionStorage.removeItem("rating");
};
