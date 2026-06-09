import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { notifySiakadWebhook } from "@/app/lib/webhook-siakad";
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
    
    const daftarDufah = await prisma.dufah.findMany({
      orderBy: { id: 'desc' },
      include: { divisi: true }
    });

    let activeDivisiSlug = "";
    if (filterDivisiId && filterDivisiId !== "ALL") {
      const activeDivisi = await prisma.divisi.findUnique({ where: { id: filterDivisiId } });
      if (activeDivisi) activeDivisiSlug = activeDivisi.slug;
    }

    const mode = searchParams.get("mode");

    const transformedDufah = daftarDufah.map((d: any) => {
      if (mode === "raw") return d;

      let namaDitampilkan = d.nama;
      const parts = d.nama.split("|");
      
      if (parts.length > 1) {
        if (activeDivisiSlug === "turots") {
          namaDitampilkan = parts[1].trim();
        } else {
          namaDitampilkan = parts[0].trim();
        }
      } else {
        // Fallback auto-calculation
        if (activeDivisiSlug === "turots") {
          const match = d.nama.match(/\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            namaDitampilkan = `Marhalah ${num - 88}`;
          } else {
            namaDitampilkan = d.nama.replace(/Duf'ah/i, "Marhalah");
          }
        }
      }

      return {
        ...d,
        nama: namaDitampilkan,
        _rawNama: d.nama
      };
    });

    return NextResponse.json(transformedDufah);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, tanggalBuka, tanggalTutup, divisiId } = body;

    const session = await getServerSession(authOptions);
    const userDivisiId = (session?.user as any)?.divisiId;

    const finalDivisiId = userDivisiId || divisiId;

    const dufahBaru = await prisma.dufah.create({
      data: {
        nama,
        isActive: false, // Default selalu false sampai diaktifkan manual
        tanggalBuka: tanggalBuka ? new Date(`${tanggalBuka}+07:00`) : null,
        tanggalTutup: tanggalTutup ? new Date(`${tanggalTutup}+07:00`) : null,
        divisiId: null, // Global
      }
    });

    notifySiakadWebhook();

    return NextResponse.json(dufahBaru, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat Duf'ah baru" }, { status: 500 });
  }
}