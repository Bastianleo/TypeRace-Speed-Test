import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, country } = body;

    if (!displayName || typeof displayName !== "string" || displayName.trim().length < 1) {
      return NextResponse.json({ error: "Nama tampilan tidak boleh kosong" }, { status: 400 });
    }
    if (displayName.trim().length > 32) {
      return NextResponse.json({ error: "Nama tampilan maksimal 32 karakter" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: displayName.trim(),
        ...(country ? { country: country.trim() } : {}),
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
