// services/serviceIcons.ts
//
// Maps a service's `name` translation key (stored in the DB) to the local
// icon asset. `require()` paths must be static for the Metro bundler, so we
// keep them in a literal object here and look up by key.

type IconSource = number;

const ICONS: Record<string, IconSource> = {
  'interior_vacuum.name':      require('@/assets/images/icons/01_interior_vacuum.png'),
  'dashboard_wipe.name':       require('@/assets/images/icons/02_dashboard_trim_wipe_down.png'),
  'seat_wash.name':            require('@/assets/images/icons/03_seat_wash_fabric.png'),
  'carpet_shampoo.name':       require('@/assets/images/icons/04_carpet_shampoo.png'),
  'leather_conditioning.name': require('@/assets/images/icons/05_leather_conditioning.png'),
  'window_cleaning.name':      require('@/assets/images/icons/06_window_cleaning_interior.png'),
  'baby_seat.name':            require('@/assets/images/icons/07_baby_seat_cleaning.png'),
  'pet_hair.name':             require('@/assets/images/icons/08_pet_hair_removal.png'),
  'trunk_cleaning.name':       require('@/assets/images/icons/09_kofferraum_reinigung.png'),
  'headliner_cleaning.name':   require('@/assets/images/icons/10_decken_reinigung.png'),

  // Home (couch / mattress) catalog. Keys are distinct from the car catalog,
  // so both brands share this map without collisions.
  'mattress_single.name':      require('@/assets/images/icons/01_mattress_vacuum.png'),
  'mattress_double.name':      require('@/assets/images/icons/02_mattress_shampoo.png'),
  'armchair.name':             require('@/assets/images/icons/03_armchair_wipe.png'),
  'sofa.name':                 require('@/assets/images/icons/04_sofa_stain_treatment.png'),
  'couch.name':                require('@/assets/images/icons/05_sectional_foam_clean.png'),
  'fabric_chair.name':         require('@/assets/images/icons/06_chair_spray_brush.png'),
};

/** Returns the asset for the given service `name` key, or `null` if unknown. */
export function getServiceIcon(name: string | null | undefined): IconSource | null {
  if (!name) return null;
  return ICONS[name] ?? null;
}
