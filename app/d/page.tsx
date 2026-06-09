import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

// Server component untuk Portal Divisi
export default async function DivisiPortal() {
  const divisiList = await prisma.divisi.findMany({
    orderBy: { nama: 'asc' }
  });

  return (
    <div className="min-h-screen bg-dark-900 bg-luxury-pattern flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-gold-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl w-full z-10 relative">
        <div className="text-center mb-12">
          <Image src="/images/logo.png" alt="Logo Markaz" width={100} height={100} className="mx-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gold-500 tracking-wide uppercase">Pilih Divisi</h1>
          <p className="text-gray-400 mt-3 text-lg">Markaz Arabiyah Pare - Kediri</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {divisiList.map((divisi) => (
            <Link 
              href={`/d/${divisi.slug}`} 
              key={divisi.id}
              className="group flex flex-col items-center justify-center p-12 rounded-3xl border border-dark-800 bg-dark-800/50 backdrop-blur-md transition-all duration-300 hover:border-gold-500/50 hover:bg-gold-500/5 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)]"
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6 text-2xl font-bold border-2 transition-all duration-300 group-hover:scale-110 shadow-lg"
                style={{ 
                  backgroundColor: `${divisi.warna}20`, 
                  borderColor: divisi.warna,
                  color: divisi.warna
                }}
              >
                {divisi.nama.charAt(0)}
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">{divisi.nama}</h2>
              <p className="text-gray-400 text-center text-sm">Lihat informasi program, pendaftaran, dan detail divisi {divisi.nama}.</p>
              
              <div className="mt-8 px-6 py-2 rounded-full border border-gold-500/30 text-gold-500 text-sm font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                Masuk Portal &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
