const DEV_API_URL = "http://localhost:8000";
const PROD_API_URL = "https://vethere-2e8b10a26a56.herokuapp.com";

export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? PROD_API_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL || DEV_API_URL;
