import { ReservationPage } from "@/components/reservation-page";
import { qixiProducts } from "@/lib/products";

export default function QixiPage() {
  return (
    <ReservationPage
      mode="qixi"
      title="Qixi cake reservations"
      subtitle="Reserve a romantic MuYi Qixi gift set with cake, photo frame, printed photo, and gift box. We confirm details and delivery on WhatsApp."
      products={qixiProducts}
    />
  );
}
