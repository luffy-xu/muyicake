import Link from "next/link";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF7EC] p-5">
      <form
        action="/api/admin/login"
        method="post"
        className="w-full max-w-md rounded-[2rem] bg-[#FFFCF7] p-6 shadow-lg"
      >
        <Link href="/" className="text-sm font-semibold text-[#6B3F2A]">
          MuYi Cakes SG
        </Link>
        <h1 className="mt-5 text-2xl font-semibold">Admin login</h1>
        <p className="mt-2 text-sm leading-6 text-[#7A6258]">
          Enter the operator password to manage reservations.
        </p>
        <input
          type="password"
          name="password"
          className="input mt-5"
          placeholder="Admin password"
          aria-label="Admin password"
          required
        />
        {error ? (
          <p className="mt-3 text-sm text-red-600">Incorrect admin password.</p>
        ) : null}
        <button className="mt-5 w-full rounded-full bg-[#6B3F2A] px-5 py-3 font-semibold text-white">
          Log in
        </button>
        <p className="mt-3 text-xs leading-5 text-[#7A6258]">
          Basic brute-force protection is tracked as a launch hardening TODO.
        </p>
      </form>
    </main>
  );
}
