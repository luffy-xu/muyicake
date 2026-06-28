export function createReservationId(date = new Date(), random = Math.random()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const suffix = Math.floor(random * 10_000)
    .toString()
    .padStart(4, "0");

  return `MUYI-${yyyy}${mm}${dd}-${suffix}`;
}
