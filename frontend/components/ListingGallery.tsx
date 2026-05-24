import ListingCard from "../components/ListingCard";

export default function ListingsPage({ listings }: { listings: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
