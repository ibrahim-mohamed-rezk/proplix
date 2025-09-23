import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  (await cookies()).set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  (await cookies()).set("user", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  (await cookies()).set("user_data", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return NextResponse.json({ message: "Logged out" });
}