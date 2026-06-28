import { ReservationPage } from "@/components/reservation-page";
import { customProducts } from "@/lib/products";

export default function CustomPage() {
  return (
    <ReservationPage
      mode="custom"
      title="Daily birthday and custom cakes"
      subtitle="Reserve a handmade cake for birthdays, kids themes, couples, family, or corporate celebrations. Share ideas now; confirm details on WhatsApp."
      products={customProducts}
    />
  );
}
