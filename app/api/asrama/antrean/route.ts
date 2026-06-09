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
    const queryDivisiId = searchParams.get("divisiId");
    const filterDivisiId = userDivisiId || queryDivisiId;

    const dufahWhereClause: any = { isActive: true };
    // Cari Duf'ah yang sedang berjalan (isActive)
    const dufahAktif = await prisma.dufah.findFirst({ where: dufahWhereClause });
    
    if (!dufahAktif) {
      return NextResponse.json([]);
    }

    // Kumpulkan ID dufah yang relevan (Aktif Saja)
    const relevantDufahIds = [dufahAktif.id];

    const dufahLamaWhere: any = { id: { lt: dufahAktif.id } };

    const dufahLama = await prisma.dufah.findFirst({
      where: dufahLamaWhere,
      orderBy: { id: 'desc' }
    });

    // Tarik semua data riwayat yang butuh kamar dari dufah aktif
    const antrean = await prisma.riwayatDufah.findMany({
      where: {
        dufahId: { in: relevantDufahIds },
        lemariId: null,
        santri: { 
          isAktif: true,
          ...(filterDivisiId && filterDivisiId !== 'ALL' ? {
            transaksi: { some: { program: { divisiId: filterDivisiId } } }
          } : {})
        },
      },
      include: {
        santri: {
          select: { id: true, nama: true, kategori: true, gender: true, nis: true, kabupaten: true }
        }
      },
      orderBy: {
        santri: { nama: 'asc' }
      }
    });

    // Tempelkan keterangan histori kamar/sakan sebelumnya
    const antreanDenganHistori = await Promise.all(antrean.map(async (row) => {
      let keteranganSakanLama = "";
      if (dufahLama) {
        const historiLama = await prisma.riwayatDufah.findFirst({
          where: {
            santriId: row.santriId,
            dufahId: dufahLama.id,
            lemariId: { not: null }
          },
          include: {
            lemari: {
              include: {
                kamar: {
                  include: {
                    sakan: true
                  }
                }
              }
            }
          }
        });

        if (historiLama?.lemari) {
          keteranganSakanLama = `${historiLama.lemari.kamar.sakan.nama} (Kamar ${historiLama.lemari.kamar.nama})`;
        }
      }

      return {
        ...row,
        keteranganSakanLama
      };
    }));

    return NextResponse.json(antreanDenganHistori);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data antrean" }, { status: 500 });
  }
}