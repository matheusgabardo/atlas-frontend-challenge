// Decides where the profile "back" button should land (docs/adr/0010):
// - 'back' → we arrived from the catalog; router.back() restores its exact scroll
//            position and loaded pages (the catalog is kept alive).
// - 'home' → deep link or any other origin; navigate to a fresh catalog.
export function catalogBackTarget(back: string | null | undefined): 'back' | 'home' {
  if (typeof back !== 'string') return 'home'
  // Came from a listing we can return to (catalog with/without filters, or favourites)
  // → router.back() restores it; a deep link or any other origin → fresh catalog.
  return back === '/' || back.startsWith('/?') || back.startsWith('/favoritos') ? 'back' : 'home'
}
