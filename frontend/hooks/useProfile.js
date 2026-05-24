import { useState, useEffect } from 'react';

export default function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProfile(data.user || null);
      setLoading(false);
    }
    fetchProfile();
  }, []);

  return { profile, loading };
}
