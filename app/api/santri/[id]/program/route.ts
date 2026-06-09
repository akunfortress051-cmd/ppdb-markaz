import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/app/lib/pusherServer";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { programId } = body;

    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || !user.permissions?.includes("all_access")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!programId) {
      return NextResponse.json({ error: "Program ID diperlukan" }, { status: 400 });
    }

    const santri = await prisma.santri.findUnique({
      where: { id },
      include: { transaksi: true }
    });

    if (!santri) {
      return NextResponse.json({ error: "Santri tidak ditemukan" }, { status: 404 });
    }

    const programBaru = await prisma.program.findUnique({
      where: { id: programId }
    });

    if (!programBaru) {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    // Ubah semua transaksi santri ini ke program yang baru
    await prisma.transaksiPendaftaran.updateMany({
      where: { santriId: id },
      data: {
        programId: programId
      }
    });

    // Masukkan langsung ke antrean kamar dengan mencabut kamar saat ini dan masa depan
    const dufahAktif = await prisma.dufah.findFirst({
      where: { isActive: true }
    });

    if (dufahAktif) {
      await prisma.riwayatDufah.updateMany({
        where: {
          santriId: id,
          dufahId: { gte: dufahAktif.id }
        },
        data: {
          lemariId: null,
          status: "PRE_LIST",
          bulanKe: 1
        }
      });
    }

    await logActivity({
      aksi: "UPDATE",
      modul: "SANTRI",
      deskripsi: `Mengganti seluruh riwayat program santri ${santri.nama} ke ${programBaru.nama}`,
      userId: user.id,
      namaUser: user.name,
      targetId: santri.id
    });

    return NextResponse.json({ message: "Program berhasil diubah" });
  } catch (error) {
    console.error("Error ganti program:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
