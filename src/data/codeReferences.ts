export interface CodeArticle {
  id: string;
  section: string;
  title: string;
  summary: string;
  fullText: string;
  keyTakeaways: string[];
}

export const NEC_CODE_ARTICLES: CodeArticle[] = [
  {
    id: '314_16_A',
    section: 'NEC 314.16(A)',
    title: 'Standard Metal Boxes Volume Calculation',
    summary: 'Defines standard volume capacities for metallic outlet boxes specified in Table 314.16(A).',
    fullText: `Standard boxes shall contain the cubic-inch (cm³) volume listed in Table 314.16(A). The volumes of standard boxes that are not listed in Table 314.16(A) shall be marked durability on the box by the manufacturer or calculated from internal dimensions. Where combination boxes or plaster rings are used, the total volume marked on the ring or box assembly shall be used.`,
    keyTakeaways: [
      'Standard metal boxes must use capacities listed in Table 314.16(A).',
      'Unlisted or custom metallic boxes must be stamped with volume or calculated by internal dimensions.',
      'Plaster/mud rings and extension rings add their marked volume to the box total.'
    ]
  },
  {
    id: '314_16_B_1',
    section: 'NEC 314.16(B)(1)',
    title: 'Conductor Fill',
    summary: 'Each conductor originating outside the box counts as 1 volume allowance based on its size.',
    fullText: `Each conductor that originates outside the box and terminates or is spliced within the box shall be counted as one conductor volume allowance. Each conductor that passes through the box without splice or termination shall be counted as one conductor volume allowance. Conductor volume allowances shall be based on Table 314.16(B). Equipment grounding conductors and internal pigtails shall be evaluated per Section 314.16(B)(5).`,
    keyTakeaways: [
      'Each wire entering the box counts as 1 conductor allowance.',
      'Unbroken wires passing through count as 1 conductor allowance.',
      'Internal pigtails starting & ending inside the box count as 0 allowance.'
    ]
  },
  {
    id: '314_16_B_2',
    section: 'NEC 314.16(B)(2)',
    title: 'Clamp Fill Allowance',
    summary: 'Where internal cable clamps are present, 1 conductor volume allowance is added based on the largest conductor in the box.',
    fullText: `Where one or more internal cable clamps, whether factory or field installed, are present in the box, a single volume allowance in accordance with Table 314.16(B) shall be made based on the largest conductor present in the box. No allowance shall be required for cable connectors with clamping mechanisms outside the box.`,
    keyTakeaways: [
      'Only 1 volume allowance total for all internal clamps combined.',
      'Allowance is calculated using the largest conductor present in the box.',
      'External cable connectors require 0 volume allowance.'
    ]
  },
  {
    id: '314_16_B_3',
    section: 'NEC 314.16(B)(3)',
    title: 'Support Fitting Fill (Studs & Hickeys)',
    summary: 'Where fixture studs or hickeys are present, 1 volume allowance is made based on the largest conductor in the box.',
    fullText: `Where one or more fixture studs or hickeys are present in the box, a single volume allowance in accordance with Table 314.16(B) shall be made based on the largest conductor present in the box.`,
    keyTakeaways: [
      'Fixture studs or hickeys require 1 single volume allowance.',
      'Based on the largest conductor present in the box.'
    ]
  },
  {
    id: '314_16_B_4',
    section: 'NEC 314.16(B)(4)',
    title: 'Device or Equipment Fill (Straps & Yokes)',
    summary: 'Each yoke or strap containing switches or receptacles counts as 2 volume allowances based on the largest conductor connected.',
    fullText: `For each yoke or strap containing one or more devices or equipment, a double volume allowance in accordance with Table 314.16(B) shall be made for each yoke or strap based on the largest conductor connected to a device(s) or equipment supported by that yoke or strap. A device or equipment building wider than a single gang shall count as double volume allowances for each gang width.`,
    keyTakeaways: [
      'Each standard 1-gang switch/receptacle yoke = 2 volume allowances.',
      'Calculated based on the largest conductor connected to that specific device.',
      '2-gang wide devices count as 2 volume allowances per gang width.'
    ]
  },
  {
    id: '314_16_B_5',
    section: 'NEC 314.16(B)(5)',
    title: 'Equipment Grounding Conductor (EGC) Fill (2020 / 2023 Rule)',
    summary: 'Up to 4 EGCs count as 1 volume allowance based on the largest EGC; each additional EGC beyond 4 adds 1/4 allowance.',
    fullText: `Where up to four equipment grounding conductors or equipment bonding jumpers enter a box, a single volume allowance based on the largest equipment grounding conductor or equipment bonding jumper entering the box shall be made. Where additional equipment grounding conductors or equipment bonding jumpers enter the box, a 1/4 volume allowance shall be made for each additional conductor or jumper over four based on the largest equipment grounding conductor or equipment bonding jumper.`,
    keyTakeaways: [
      '1 to 4 EGCs = 1 single volume allowance of the largest EGC.',
      '5+ EGCs = 1 allowance + 0.25 allowance per EGC over 4.',
      'Isolated ground conductors add an additional single volume allowance per NEC 314.16(B)(5).'
    ]
  }
];

export const INSPECTION_CHECKLIST = [
  'Verify all wire sizes (AWG) match breaker ratings and circuit requirements.',
  'Confirm internal clamps vs external cable connectors.',
  'Check whether pigtails originate and terminate solely within the box.',
  'Verify device strap allowances (receptacles, switches, GFCIs count as double volume).',
  'Ensure mud rings or extension rings have legibly stamped volume markings if used.',
  'Check grounding conductor count and apply NEC 2020/2023 1/4 allowance rule for >4 grounds.',
  'Verify box total volume capacity against overall calculated fill volume.'
];
