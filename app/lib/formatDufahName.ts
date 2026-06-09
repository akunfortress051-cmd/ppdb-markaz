export function formatDufahName(rawNama: string | undefined | null, divisiSlug?: string): string {
  if (!rawNama) return "Duf'ah Tidak Diketahui";

  let namaDitampilkan = rawNama;
  const parts = rawNama.split("|");
  
  if (parts.length > 1) {
    if (divisiSlug === "turots") {
      namaDitampilkan = parts[1].trim();
    } else {
      namaDitampilkan = parts[0].trim();
    }
  } else {
    // Fallback auto-calculation
    if (divisiSlug === "turots") {
      const match = rawNama.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        namaDitampilkan = `Marhalah ${num - 88}`;
      } else {
        namaDitampilkan = rawNama.replace(/Duf'ah/i, "Marhalah");
      }
    }
  }

  return namaDitampilkan;
}
