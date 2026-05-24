import { useEffect, useState } from "react";

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  user_id: number;
}

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings`);
        const data = await res.json();
        setListings(data);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  return { listings, loading };
}
