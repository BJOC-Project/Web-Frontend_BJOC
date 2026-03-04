const BASE_URL = import.meta.env.VITE_API_URL;

export const getStops = async () => {
  const res = await fetch(`${BASE_URL}/api/stops`);

  if (!res.ok) {
    throw new Error("Failed to fetch stops");
  }

  return res.json();
};

export const addStop = async (stop: {
  name: string;
  latitude: number;
  longitude: number;
}) => {
  const res = await fetch(`${BASE_URL}/api/stops`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stop),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to add stop");
  }

  return data;
};

export const updateStop = async (
  id: string,
  stop: { name: string; latitude: number; longitude: number }
) => {
  const res = await fetch(`${BASE_URL}/api/stops/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stop),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to update stop");
  }

  return data;
};

export const deleteStop = async (id: string) => {
  const res = await fetch(`${BASE_URL}/api/stops/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete stop");
  }

  return res.json();
};