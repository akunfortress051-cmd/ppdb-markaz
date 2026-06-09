import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const divisi = await prisma.divisi.findMany({
      orderBy: { nama: 'asc' }
    });
    return NextResponse.json(divisi);
  } catch (error) {
    console.error("Error fetching divisi:", error);
    return NextResponse.json({ error: "Gagal mengambil data divisi" }, { status: 500 });
  }
}
