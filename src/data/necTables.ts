import { WireSize, StandardBox, ExtensionRing, WiringPreset, CableType } from '../types/nec';

// NEC Table 314.16(B) Volume Allowance Required per Conductor
export const NEC_CONDUCTOR_VOLUMES: Record<WireSize, { cuIn: number; cm3: number }> = {
  '18': { cuIn: 1.50, cm3: 24.6 },
  '16': { cuIn: 1.75, cm3: 28.7 },
  '14': { cuIn: 2.00, cm3: 32.8 },
  '12': { cuIn: 2.25, cm3: 36.9 },
  '10': { cuIn: 2.50, cm3: 41.0 },
  '8':  { cuIn: 3.00, cm3: 49.2 },
  '6':  { cuIn: 5.00, cm3: 81.9 },
  '4':  { cuIn: 6.50, cm3: 106.5 },
  '3':  { cuIn: 7.50, cm3: 123.0 },
  '2':  { cuIn: 9.00, cm3: 147.0 },
  '1':  { cuIn: 10.50, cm3: 172.0 },
  '1/0': { cuIn: 12.50, cm3: 205.0 },
  '2/0': { cuIn: 15.00, cm3: 246.0 },
  '3/0': { cuIn: 17.50, cm3: 287.0 },
  '4/0': { cuIn: 20.00, cm3: 328.0 },
};

// AWG Wire Order for comparison (index higher = larger wire)
export const WIRE_SIZE_ORDER: WireSize[] = [
  '18', '16', '14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0'
];

export function getLargerWireSize(sizeA: WireSize, sizeB: WireSize): WireSize {
  const indexA = WIRE_SIZE_ORDER.indexOf(sizeA);
  const indexB = WIRE_SIZE_ORDER.indexOf(sizeB);
  return indexA >= indexB ? sizeA : sizeB;
}

// Common jacketed cables. Each expands into its insulated conductors plus the
// equipment grounding conductor that rides along with it, so the ground is never
// forgotten. Only sizes whose EGC matches the circuit conductors are listed —
// larger NM-B assemblies use a reduced ground and should be entered as loose
// conductors instead.
export const CABLE_TYPES: CableType[] = [
  {
    id: 'nm_14_2',
    name: '14/2 NM-B w/ ground',
    shortLabel: '14/2 NM-B',
    category: 'nm',
    size: '14',
    insulatedCount: 2,
    hasEgc: true,
    egcSize: '14',
    clampsTypical: true
  },
  {
    id: 'nm_14_3',
    name: '14/3 NM-B w/ ground',
    shortLabel: '14/3 NM-B',
    category: 'nm',
    size: '14',
    insulatedCount: 3,
    hasEgc: true,
    egcSize: '14',
    clampsTypical: true
  },
  {
    id: 'nm_12_2',
    name: '12/2 NM-B w/ ground',
    shortLabel: '12/2 NM-B',
    category: 'nm',
    size: '12',
    insulatedCount: 2,
    hasEgc: true,
    egcSize: '12',
    clampsTypical: true
  },
  {
    id: 'nm_12_3',
    name: '12/3 NM-B w/ ground',
    shortLabel: '12/3 NM-B',
    category: 'nm',
    size: '12',
    insulatedCount: 3,
    hasEgc: true,
    egcSize: '12',
    clampsTypical: true
  },
  {
    id: 'nm_10_2',
    name: '10/2 NM-B w/ ground',
    shortLabel: '10/2 NM-B',
    category: 'nm',
    size: '10',
    insulatedCount: 2,
    hasEgc: true,
    egcSize: '10',
    clampsTypical: true
  },
  {
    id: 'nm_10_3',
    name: '10/3 NM-B w/ ground',
    shortLabel: '10/3 NM-B',
    category: 'nm',
    size: '10',
    insulatedCount: 3,
    hasEgc: true,
    egcSize: '10',
    clampsTypical: true
  },
  {
    id: 'uf_12_2',
    name: '12/2 UF-B w/ ground',
    shortLabel: '12/2 UF-B',
    category: 'uf',
    size: '12',
    insulatedCount: 2,
    hasEgc: true,
    egcSize: '12',
    clampsTypical: true
  },
  {
    id: 'mc_14_2',
    name: '14/2 MC Cable',
    shortLabel: '14/2 MC',
    category: 'mc',
    size: '14',
    insulatedCount: 2,
    hasEgc: true,
    egcSize: '14',
    clampsTypical: false,
    note: 'MC connectors mount outside the box wall — no internal clamp allowance unless clamps sit inside.'
  },
  {
    id: 'mc_12_2',
    name: '12/2 MC Cable',
    shortLabel: '12/2 MC',
    category: 'mc',
    size: '12',
    insulatedCount: 2,
    hasEgc: true,
    egcSize: '12',
    clampsTypical: false,
    note: 'MC connectors mount outside the box wall — no internal clamp allowance unless clamps sit inside.'
  },
  {
    id: 'mc_12_3',
    name: '12/3 MC Cable',
    shortLabel: '12/3 MC',
    category: 'mc',
    size: '12',
    insulatedCount: 3,
    hasEgc: true,
    egcSize: '12',
    clampsTypical: false,
    note: 'MC connectors mount outside the box wall — no internal clamp allowance unless clamps sit inside.'
  },
  {
    id: 'ac_14_2',
    name: '14/2 AC (BX) Cable',
    shortLabel: '14/2 AC',
    category: 'ac',
    size: '14',
    insulatedCount: 2,
    hasEgc: false,
    egcSize: '14',
    clampsTypical: true,
    note: 'Armor is the equipment grounding path; the bonding strip gets no volume allowance.'
  },
  {
    id: 'ac_12_2',
    name: '12/2 AC (BX) Cable',
    shortLabel: '12/2 AC',
    category: 'ac',
    size: '12',
    insulatedCount: 2,
    hasEgc: false,
    egcSize: '12',
    clampsTypical: true,
    note: 'Armor is the equipment grounding path; the bonding strip gets no volume allowance.'
  }
];

// Mud rings and extension rings physically land on 4" and 4-11/16" square boxes.
// Device boxes, octagons and molded gang boxes take none, so the box recommender
// never proposes hardware that will not bolt together.
export function isRingCompatible(box: StandardBox, ringId: string): boolean {
  if (ringId === 'none') return true;
  return box.category === 'square_4in' || box.category === 'square_4_11_16in';
}

// NEC Table 314.16(A) Metal Boxes Standard Volumes
export const STANDARD_BOXES: StandardBox[] = [
  // Round & Octagonal Boxes
  {
    id: 'oct_4_1_25',
    name: '4" x 1-1/4" Octagonal / Round',
    tradeSize: '4 x 1-1/4 in',
    category: 'octagonal_round',
    volumeCuIn: 12.5,
    volumeCm3: 205,
    depthInches: 1.25,
    description: 'Standard shallow round box for ceiling fixtures'
  },
  {
    id: 'oct_4_1_50',
    name: '4" x 1-1/2" Octagonal / Round',
    tradeSize: '4 x 1-1/2 in',
    category: 'octagonal_round',
    volumeCuIn: 15.5,
    volumeCm3: 254,
    depthInches: 1.5,
    description: 'Standard ceiling junction box'
  },
  {
    id: 'oct_4_2_125',
    name: '4" x 2-1/8" Octagonal / Round',
    tradeSize: '4 x 2-1/8 in',
    category: 'octagonal_round',
    volumeCuIn: 21.5,
    volumeCm3: 352,
    depthInches: 2.125,
    description: 'Deep round box for fan/fixture mounting'
  },

  // 4-Inch Square Boxes (4" x 4")
  {
    id: 'sq_4_1_25',
    name: '4" x 1-1/4" Square',
    tradeSize: '4 x 1-1/4 in',
    category: 'square_4in',
    volumeCuIn: 18.0,
    volumeCm3: 295,
    depthInches: 1.25,
    description: 'Shallow 4-inch square metallic box'
  },
  {
    id: 'sq_4_1_50',
    name: '4" x 1-1/2" Square',
    tradeSize: '4 x 1-1/2 in',
    category: 'square_4in',
    volumeCuIn: 21.0,
    volumeCm3: 344,
    depthInches: 1.5,
    description: 'Standard 4-inch square metallic junction box (1900 Box)'
  },
  {
    id: 'sq_4_2_125',
    name: '4" x 2-1/8" Square',
    tradeSize: '4 x 2-1/8 in',
    category: 'square_4in',
    volumeCuIn: 30.3,
    volumeCm3: 497,
    depthInches: 2.125,
    description: 'Deep 4-inch square metallic box (deep 1900)'
  },

  // 4-11/16 Inch Square Boxes
  {
    id: 'sq_411_1_50',
    name: '4-11/16" x 1-1/2" Square',
    tradeSize: '4-11/16 x 1-1/2 in',
    category: 'square_4_11_16in',
    volumeCuIn: 29.5,
    volumeCm3: 483,
    depthInches: 1.5,
    description: 'Standard 4-11/16 large commercial square box'
  },
  {
    id: 'sq_411_2_125',
    name: '4-11/16" x 2-1/8" Square',
    tradeSize: '4-11/16 x 2-1/8 in',
    category: 'square_4_11_16in',
    volumeCuIn: 42.0,
    volumeCm3: 688,
    depthInches: 2.125,
    description: 'Deep 4-11/16 large commercial square box'
  },

  // Device Boxes (3" x 2")
  {
    id: 'dev_32_2',
    name: '3" x 2" x 2" Device Box',
    tradeSize: '3 x 2 x 2 in',
    category: 'device_box',
    volumeCuIn: 10.0,
    volumeCm3: 164,
    depthInches: 2.0,
    description: 'Shallow single-gang metallic switch box'
  },
  {
    id: 'dev_32_2_25',
    name: '3" x 2" x 2-1/4" Device Box',
    tradeSize: '3 x 2 x 2-1/4 in',
    category: 'device_box',
    volumeCuIn: 10.5,
    volumeCm3: 172,
    depthInches: 2.25,
    description: 'Single-gang switch box'
  },
  {
    id: 'dev_32_2_50',
    name: '3" x 2" x 2-1/2" Device Box',
    tradeSize: '3 x 2 x 2-1/2 in',
    category: 'device_box',
    volumeCuIn: 12.5,
    volumeCm3: 205,
    depthInches: 2.5,
    description: 'Standard single-gang switch box'
  },
  {
    id: 'dev_32_2_75',
    name: '3" x 2" x 2-3/4" Device Box',
    tradeSize: '3 x 2 x 2-3/4 in',
    category: 'device_box',
    volumeCuIn: 14.0,
    volumeCm3: 229,
    depthInches: 2.75,
    description: 'Medium deep single-gang switch box'
  },
  {
    id: 'dev_32_3_50',
    name: '3" x 2" x 3-1/2" Device Box',
    tradeSize: '3 x 2 x 3-1/2 in',
    category: 'device_box',
    volumeCuIn: 18.0,
    volumeCm3: 295,
    depthInches: 3.5,
    description: 'Deep single-gang metallic switch box'
  },

  // Handy / FS Surface Boxes
  {
    id: 'handy_4_2_1_875',
    name: '4" x 2-1/8" x 1-7/8" Handy Box',
    tradeSize: '4 x 2-1/8 x 1-7/8 in',
    category: 'handy_fs',
    volumeCuIn: 13.0,
    volumeCm3: 213,
    depthInches: 1.875,
    description: 'Surface mount single-gang utility box'
  },
  {
    id: 'handy_4_2_2_125',
    name: '4" x 2-1/8" x 2-1/8" Handy Box',
    tradeSize: '4 x 2-1/8 x 2-1/8 in',
    category: 'handy_fs',
    volumeCuIn: 14.0,
    volumeCm3: 229,
    depthInches: 2.125,
    description: 'Deep surface mount utility box'
  },

  // Nonmetallic Plastic Standard Boxes
  {
    id: 'nm_1gang_18',
    name: 'Nonmetallic Single Gang (18.0 cu in)',
    tradeSize: 'Single Gang Plastic',
    category: 'nonmetallic_gang',
    volumeCuIn: 18.0,
    volumeCm3: 295,
    description: 'Standard 1-gang nail-on plastic box'
  },
  {
    id: 'nm_1gang_20',
    name: 'Nonmetallic Single Gang (20.3 cu in)',
    tradeSize: 'Single Gang Deep Plastic',
    category: 'nonmetallic_gang',
    volumeCuIn: 20.3,
    volumeCm3: 333,
    description: 'Deep 1-gang nail-on plastic box'
  },
  {
    id: 'nm_1gang_22_5',
    name: 'Nonmetallic Single Gang (22.5 cu in)',
    tradeSize: 'Single Gang Extra Deep',
    category: 'nonmetallic_gang',
    volumeCuIn: 22.5,
    volumeCm3: 369,
    description: 'Extra deep 1-gang plastic box'
  },
  {
    id: 'nm_2gang_34',
    name: 'Nonmetallic 2-Gang (34.0 cu in)',
    tradeSize: '2-Gang Plastic',
    category: 'nonmetallic_gang',
    volumeCuIn: 34.0,
    volumeCm3: 557,
    description: 'Standard 2-gang plastic box'
  },
  {
    id: 'nm_2gang_42',
    name: 'Nonmetallic 2-Gang (42.0 cu in)',
    tradeSize: '2-Gang Deep Plastic',
    category: 'nonmetallic_gang',
    volumeCuIn: 42.0,
    volumeCm3: 688,
    description: 'Deep 2-gang plastic box'
  },
  {
    id: 'nm_3gang_58',
    name: 'Nonmetallic 3-Gang (58.0 cu in)',
    tradeSize: '3-Gang Plastic',
    category: 'nonmetallic_gang',
    volumeCuIn: 58.0,
    volumeCm3: 950,
    description: 'Standard 3-gang plastic box'
  },
  {
    id: 'nm_4gang_74',
    name: 'Nonmetallic 4-Gang (74.0 cu in)',
    tradeSize: '4-Gang Plastic',
    category: 'nonmetallic_gang',
    volumeCuIn: 74.0,
    volumeCm3: 1213,
    description: 'Standard 4-gang plastic box'
  }
];

export const EXTENSION_RINGS: ExtensionRing[] = [
  { id: 'none', name: 'None (0 cu in)', volumeCuIn: 0 },
  { id: 'mud_1_4', name: '1/4" Single-Gang Mud Ring (+2.0 cu in)', volumeCuIn: 2.0 },
  { id: 'mud_1_2', name: '1/2" Single-Gang Mud Ring (+3.5 cu in)', volumeCuIn: 3.5 },
  { id: 'mud_5_8', name: '5/8" Single-Gang Mud Ring (+4.3 cu in)', volumeCuIn: 4.3 },
  { id: 'mud_3_4', name: '3/4" Single-Gang Mud Ring (+5.5 cu in)', volumeCuIn: 5.5 },
  { id: 'mud_2g_1_2', name: '1/2" 2-Gang Mud Ring (+6.0 cu in)', volumeCuIn: 6.0 },
  { id: 'mud_2g_5_8', name: '5/8" 2-Gang Mud Ring (+7.3 cu in)', volumeCuIn: 7.3 },
  { id: 'ext_sq_1_5', name: '4" Square Extension Ring 1-1/2" (+21.0 cu in)', volumeCuIn: 21.0 },
  { id: 'ext_sq_2_125', name: '4" Square Extension Ring 2-1/8" (+30.3 cu in)', volumeCuIn: 30.3 },
  { id: 'custom', name: 'Custom Ring Volume...', volumeCuIn: 0 }
];

export const WIRING_PRESETS: WiringPreset[] = [
  {
    id: 'res_bedroom_outlet',
    title: 'Bedroom 15A Receptacle Pass-Through',
    description: 'Single-gang box with 2x 14/2 Romex cables (4 insulated 14 AWG + ground) and 1 duplex receptacle.',
    category: 'Residential',
    inputs: {
      boxType: 'standard',
      selectedStandardBoxId: 'nm_1gang_18',
      hasInternalClamps: false,
      egcCount: 2,
      largestEgcSize: '14',
      conductors: [
        { id: '1', size: '14', count: 4, isPigtail: false, description: '14 AWG Hot & Neutral line/load' }
      ],
      devices: [
        { id: 'd1', type: 'receptacle', gangs: 1, wireSizeConnected: '14', description: 'Duplex Receptacle' }
      ]
    }
  },
  {
    id: 'res_kitchen_gfci',
    title: 'Kitchen 20A GFCI Circuit',
    description: '20 Amp kitchen countertop circuit with 12/2 feed in, 12/2 load out, and 1 GFCI receptacle.',
    category: 'Residential',
    inputs: {
      boxType: 'standard',
      selectedStandardBoxId: 'nm_1gang_22_5',
      hasInternalClamps: false,
      egcCount: 2,
      largestEgcSize: '12',
      conductors: [
        { id: '1', size: '12', count: 4, isPigtail: false, description: '12 AWG Line & Load' }
      ],
      devices: [
        { id: 'd1', type: 'gfci', gangs: 1, wireSizeConnected: '12', description: '20A GFCI Receptacle' }
      ]
    }
  },
  {
    id: 'res_3way_switch',
    title: '3-Way Switch Box (14 AWG)',
    description: '3-way switch box receiving 14/2 power feed and 14/3 traveler cable (5 insulated 14 AWG conductors total).',
    category: 'Residential',
    inputs: {
      boxType: 'standard',
      selectedStandardBoxId: 'nm_1gang_20',
      hasInternalClamps: false,
      egcCount: 2,
      largestEgcSize: '14',
      conductors: [
        { id: '1', size: '14', count: 5, isPigtail: false, description: '14 AWG Hot, Travelers & Neutral' }
      ],
      devices: [
        { id: 'd1', type: 'switch', gangs: 1, wireSizeConnected: '14', description: '3-Way Toggle Switch' }
      ]
    }
  },
  {
    id: 'comm_4in_junction',
    title: 'Commercial 4" Square Splicing Box',
    description: 'Metal 4x1-1/2 square box with internal clamps, 6x 12 AWG THHN conductors, 2x 10 AWG THHN, and 3 grounds.',
    category: 'Commercial',
    inputs: {
      boxType: 'standard',
      selectedStandardBoxId: 'sq_4_1_50',
      extensionRingId: 'mud_1_2',
      hasInternalClamps: true,
      clampWireSize: '10',
      egcCount: 3,
      largestEgcSize: '10',
      conductors: [
        { id: '1', size: '12', count: 6, isPigtail: false, description: '12 AWG Phase & Neutral' },
        { id: '2', size: '10', count: 2, isPigtail: false, description: '10 AWG Dedicated Feed' }
      ],
      devices: []
    }
  },
  {
    id: 'res_ceiling_fan',
    title: 'Ceiling Fan / Luminaire Box',
    description: 'Ceiling fixture box with support fixture stud/hickey, 14/3 Romex feed (3 insulated 14 AWG conductors + ground).',
    category: 'Specialty',
    inputs: {
      boxType: 'standard',
      selectedStandardBoxId: 'oct_4_2_125',
      hasInternalClamps: true,
      clampWireSize: '14',
      hasSupportFittings: true,
      supportFittingWireSize: '14',
      egcCount: 1,
      largestEgcSize: '14',
      conductors: [
        { id: '1', size: '14', count: 3, isPigtail: false, description: '14/3 Wire Feed' }
      ],
      devices: []
    }
  }
];
