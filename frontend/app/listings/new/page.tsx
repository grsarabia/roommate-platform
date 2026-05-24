"use client";

import ListingForm from "../../../components/ListingForm";

export default function NewListingPage() {
  async function handleSubmit(data: any) {
    const formData = new FormData();
    formData.append("listing[title]", data.title);
    formData.append("listing[description]", data.description);
    formData.append("listing[price]", data.price);
    formData.append("listing[comuna]", data.comuna);
    formData.append("listing[address_text]", data.address_text);
    formData.append("listing[gastos_incluidos]", String(data.gastos_incluidos));

    data.photos.forEach((file: File) => {
      formData.append("listing[photos][]", file);
    });
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nueva publicación</h1>
      <ListingForm onSubmit={handleSubmit} />
    </div>
  );
}
