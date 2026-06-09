"use client";

import LandingPage from "@/app/page";

export default function DivisiLandingPage({ params }: { params: { slug: string } }) {
  return <LandingPage divisiSlug={params.slug} />;
}
