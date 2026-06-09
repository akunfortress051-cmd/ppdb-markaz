import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    // 1. Cek Admin Divisi
    let userDivisiId = (session?.user as any)?.divisiId;
    
    // 2. Cek Saklar Super Admin (dikirim dari frontend via query param)
    const queryDivisiId = searchParams.get("divisiId");
    
    const filterDivisiId = userDivisiId || queryDivisiId;
    
    const whereClause: any = {};
    if (filterDivisiId && filterDivisiId !== 'ALL') {
      whereClause.divisiId = filterDivisiId;
    }

    // Optionally filter by active
    const isActiveParam = searchParams.get("isActive");
    if (isActiveParam === "true") {
      whereClause.isActive = true;
    }

    const programs = await prisma.program.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      include: { divisi: true }
    });
    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error GET Program:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data program" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, harga, durasiBulan, isActive, tanggalMulaiDefault, tanggalTutupDefault, divisiId } = body;

    const session = await getServerSession(authOptions);
    const userDivisiId = (session?.user as any)?.divisiId;
    const finalDivisiId = userDivisiId || divisiId;

    if (!nama || harga === undefined || durasiBulan === undefined) {
      return NextResponse.json(
        { error: "Nama, harga, dan durasi bulan wajib diisi" },
        { status: 400 }
      );
    }

    const newProgram = await prisma.program.create({
      data: {
        nama,
        harga: parseFloat(harga),
        durasiBulan: parseInt(durasiBulan),
        isActive: isActive !== undefined ? isActive : true,
        tanggalMulaiDefault,
        tanggalTutupDefault,
        divisiId: finalDivisiId || null
      },
    });

    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    console.error("Error POST Program:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan program" },
      { status: 500 }
    );
  }
}
