export type Architect = {
  id: string; name: string; firm: string; speciality: string; years: number;
  rating: number; fee: string; availability: "Available" | "Limited" | "Booked";
};

export const ARCHITECTS: Architect[] = [
  { id: "lm", name: "Lerato Mokoena", firm: "Mokoena Architects", speciality: "Residential", years: 14, rating: 4.9, fee: "8–10% of build", availability: "Available" },
  { id: "pv", name: "Pieter van der Merwe", firm: "VDM Design Studio", speciality: "Educational", years: 22, rating: 4.8, fee: "7–9% of build", availability: "Limited" },
  { id: "ak", name: "Ayesha Khan", firm: "Khan & Partners", speciality: "Sustainable", years: 11, rating: 4.7, fee: "9–11% of build", availability: "Available" },
  { id: "sd", name: "Sipho Dlamini", firm: "Ubuntu Built Form", speciality: "Educational", years: 17, rating: 4.6, fee: "7–8% of build", availability: "Booked" },
  { id: "jn", name: "Jessica Naidoo", firm: "Coastline Architecture", speciality: "Residential", years: 9, rating: 4.5, fee: "6–8% of build", availability: "Available" },
  { id: "tb", name: "Thabo Botha", firm: "Highveld Modern", speciality: "Luxury Residential", years: 19, rating: 4.9, fee: "10–12% of build", availability: "Limited" },
];

export const SPECIALITIES = Array.from(new Set(ARCHITECTS.map((a) => a.speciality)));
