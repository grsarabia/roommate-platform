import ListingCard from "../components/ListingCard";

export default function ListingsPage({ listings }: { listings: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {listings.map((listing, index) => (
        <div
          key={listing.id}
          style={{ animationDelay: `${index * 0.1}s` }}
          className="animate-fade-in"
        >
          <ListingCard listing={listing} />
        </div>
      ))}
    </div>
  );
}
