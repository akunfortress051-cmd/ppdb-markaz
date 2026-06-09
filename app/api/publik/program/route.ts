import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const divisiId = searchParams.get("divisiId");

    const whereClause: any = { isActive: true };
    if (divisiId) {
      whereClause.divisiId = divisiId;
    }

    const programs = await prisma.program.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error GET Public Programs:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data program" },
      { status: 500 }
    );
  }
}
