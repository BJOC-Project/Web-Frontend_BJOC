const BASE_URL = "http://localhost:5000";

export const getJeeps = async () => {
  const response = await fetch(`${BASE_URL}/api/jeeps`);
  if (!response.ok) {
    throw new Error("Failed to fetch jeeps");
  }
  return response.json();
};