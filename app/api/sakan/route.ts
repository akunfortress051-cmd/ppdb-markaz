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

    // Cari Duf'ah yang sedang aktif (Global)
    const dufahWhereClause: any = { isActive: true };
    const dufahAktif = await prisma.dufah.findFirst({ where: dufahWhereClause });

    // Kumpulkan ID dufah yang relevan
    const relevantDufahIds = dufahAktif ? [dufahAktif.id] : [];

    const sakanWhereClause: any = {};
    if (filterDivisiId && filterDivisiId !== 'ALL') {
      sakanWhereClause.divisiId = filterDivisiId;
    }

    const dataSakan = await prisma.sakan.findMany({
      where: sakanWhereClause,
      include: {
        divisi: true,
        kamar: {
          include: {
            lemari: {
              include: {
                // HANYA tarik penghuni di bulan ini, lengkapi dengan data santrinya
                penghuni: relevantDufahIds.length > 0 ? {
                  where: { dufahId: { in: relevantDufahIds }, status: { not: "CHECKED_OUT" } },
                  include: { santri: true }
                } : false
              },
              orderBy: { nomor: 'asc' }
            }
          },
          orderBy: { nama: 'asc' }
        }
      },
      orderBy: { nama: 'asc' }
    });
    return NextResponse.json(dataSakan);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat Sakan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, kategori, divisiId } = body; 

    const session = await getServerSession(authOptions);
    const userDivisiId = (session?.user as any)?.divisiId;
    const finalDivisiId = userDivisiId || divisiId;

    const sakanBaru = await prisma.sakan.create({
      data: { 
        nama, 
        kategori: kategori || "BANIN",
        divisiId: finalDivisiId || null
      }
    });

    return NextResponse.json(sakanBaru, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat Sakan" }, { status: 500 });
  }
}