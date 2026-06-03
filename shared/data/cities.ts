// Curated set of major Brazilian cities (state capitals + large cities) used to place
// suppliers and to compute distance. `weight` drives the weighted distribution in the seed
// (roughly population-based) so searches in big cities always return results.
//
// Best-effort IBGE codes and approximate city-center coordinates — good enough for relative
// distance. The full national municipality list (combobox) is a later step (see roadmap #10).

export interface SeedCity {
  state: string
  city: string
  ibgeCode: string
  lat: number
  lng: number
  weight: number
}

export const CITIES: SeedCity[] = [
  { state: 'SP', city: 'São Paulo', ibgeCode: '3550308', lat: -23.55, lng: -46.63, weight: 100 },
  { state: 'RJ', city: 'Rio de Janeiro', ibgeCode: '3304557', lat: -22.91, lng: -43.2, weight: 70 },
  { state: 'DF', city: 'Brasília', ibgeCode: '5300108', lat: -15.79, lng: -47.88, weight: 45 },
  { state: 'BA', city: 'Salvador', ibgeCode: '2927408', lat: -12.97, lng: -38.51, weight: 40 },
  { state: 'CE', city: 'Fortaleza', ibgeCode: '2304400', lat: -3.73, lng: -38.52, weight: 38 },
  { state: 'MG', city: 'Belo Horizonte', ibgeCode: '3106200', lat: -19.92, lng: -43.94, weight: 36 },
  { state: 'AM', city: 'Manaus', ibgeCode: '1302603', lat: -3.12, lng: -60.02, weight: 33 },
  { state: 'PR', city: 'Curitiba', ibgeCode: '4106902', lat: -25.43, lng: -49.27, weight: 31 },
  { state: 'PE', city: 'Recife', ibgeCode: '2611606', lat: -8.05, lng: -34.88, weight: 29 },
  { state: 'RS', city: 'Porto Alegre', ibgeCode: '4314902', lat: -30.03, lng: -51.23, weight: 28 },
  { state: 'GO', city: 'Goiânia', ibgeCode: '5208707', lat: -16.69, lng: -49.26, weight: 25 },
  { state: 'PA', city: 'Belém', ibgeCode: '1501402', lat: -1.46, lng: -48.5, weight: 24 },
  { state: 'SP', city: 'Guarulhos', ibgeCode: '3518800', lat: -23.45, lng: -46.53, weight: 20 },
  { state: 'SP', city: 'Campinas', ibgeCode: '3509502', lat: -22.91, lng: -47.06, weight: 20 },
  { state: 'MA', city: 'São Luís', ibgeCode: '2111300', lat: -2.53, lng: -44.3, weight: 18 },
  { state: 'AL', city: 'Maceió', ibgeCode: '2704302', lat: -9.67, lng: -35.74, weight: 16 },
  { state: 'RN', city: 'Natal', ibgeCode: '2408102', lat: -5.79, lng: -35.21, weight: 15 },
  { state: 'MS', city: 'Campo Grande', ibgeCode: '5002704', lat: -20.47, lng: -54.62, weight: 15 },
  { state: 'PI', city: 'Teresina', ibgeCode: '2211001', lat: -5.09, lng: -42.8, weight: 15 },
  { state: 'PB', city: 'João Pessoa', ibgeCode: '2507507', lat: -7.12, lng: -34.86, weight: 14 },
  { state: 'MT', city: 'Cuiabá', ibgeCode: '5103403', lat: -15.6, lng: -56.1, weight: 13 },
  { state: 'SC', city: 'Florianópolis', ibgeCode: '4205407', lat: -27.59, lng: -48.55, weight: 13 },
  { state: 'ES', city: 'Vitória', ibgeCode: '3205309', lat: -20.32, lng: -40.34, weight: 12 },
  { state: 'SP', city: 'Santos', ibgeCode: '3548500', lat: -23.96, lng: -46.33, weight: 12 },
  { state: 'SP', city: 'Ribeirão Preto', ibgeCode: '3543402', lat: -21.18, lng: -47.81, weight: 12 },
  { state: 'MG', city: 'Uberlândia', ibgeCode: '3170206', lat: -18.92, lng: -48.28, weight: 12 },
  { state: 'SP', city: 'Sorocaba', ibgeCode: '3552205', lat: -23.5, lng: -47.46, weight: 11 },
  { state: 'PR', city: 'Londrina', ibgeCode: '4113700', lat: -23.31, lng: -51.16, weight: 11 },
  { state: 'SC', city: 'Joinville', ibgeCode: '4209102', lat: -26.3, lng: -48.85, weight: 11 },
  { state: 'SE', city: 'Aracaju', ibgeCode: '2800308', lat: -10.95, lng: -37.07, weight: 11 },
  { state: 'RJ', city: 'Niterói', ibgeCode: '3303302', lat: -22.88, lng: -43.1, weight: 10 },
  { state: 'RS', city: 'Caxias do Sul', ibgeCode: '4305108', lat: -29.17, lng: -51.18, weight: 10 },
  { state: 'RO', city: 'Porto Velho', ibgeCode: '1100205', lat: -8.76, lng: -63.9, weight: 9 },
  { state: 'AP', city: 'Macapá', ibgeCode: '1600303', lat: 0.03, lng: -51.07, weight: 8 },
  { state: 'TO', city: 'Palmas', ibgeCode: '1721000', lat: -10.18, lng: -48.33, weight: 7 },
  { state: 'AC', city: 'Rio Branco', ibgeCode: '1200401', lat: -9.97, lng: -67.81, weight: 7 },
  { state: 'RR', city: 'Boa Vista', ibgeCode: '1400100', lat: 2.82, lng: -60.67, weight: 6 },
]

export const CITY_BY_IBGE: Record<string, SeedCity> = Object.fromEntries(
  CITIES.map((c) => [c.ibgeCode, c]),
)

/** Lookup by `${state}:${city}` — used to resolve the reference city for distance. */
export const CITY_BY_KEY: Record<string, SeedCity> = Object.fromEntries(
  CITIES.map((c) => [`${c.state}:${c.city}`, c]),
)

/** States (UF) → city names, for the city picker. Derived from the curated city set. */
export const STATES: Record<string, string[]> = CITIES.reduce<Record<string, string[]>>((acc, c) => {
  ;(acc[c.state] ??= []).push(c.city)
  return acc
}, {})
