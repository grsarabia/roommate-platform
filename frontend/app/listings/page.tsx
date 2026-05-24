"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ListingGallery from "../../components/ListingGallery";

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchListings() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings`);
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    }
    fetchListings();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Publicaciones</h1>
      <Link href="/listings/new">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md shadow">
          ➕ Crear publicación
        </button>
      </Link>

      {/* Galería de publicaciones */}
      <ListingGallery listings={listings} />
    </div>
  );
}
