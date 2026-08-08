import { NextRequest, NextResponse } from "next/server";

// Kredensial kiosk HANYA di server-side env (tidak pernah masuk bundle publik).
// Route ini yang dipanggil FE untuk auto-login kiosk — kredensial tetap di server.
export async function POST(req: NextRequest) {
  const username = process.env.KIOSK_USERNAME;
  const password = process.env.KIOSK_PASSWORD;
  if (!username || !password) {
    return NextResponse.json(
      { message: "KIOSK_USERNAME/KIOSK_PASSWORD belum diset di server" },
      { status: 503 },
    );
  }

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:6673/api").replace(/\/$/, "");
  try {
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginKey: username, password }),
      cache: "no-store",
    });
    const data = await res.json();
    const body = data?.data ?? data;
    if (!res.ok || !body?.access_token) {
      return NextResponse.json(
        { message: data?.message || "Kiosk login gagal" },
        { status: 502 },
      );
    }
    // Hanya return token + user — kredensial tidak pernah keluar dari server
    return NextResponse.json({
      token: body.access_token,
      user: body.user ?? null,
    });
  } catch {
    return NextResponse.json(
      { message: "Backend tidak bisa dijangkau" },
      { status: 502 },
    );
  }
}
