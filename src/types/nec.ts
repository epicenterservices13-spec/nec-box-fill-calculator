export type WireSize = 
  | '18' | '16' | '14' | '12' | '10' | '8' | '6' | '4' | '3' | '2' | '1' | '1/0' | '2/0' | '3/0' | '4/0';

export interface ConductorEntry {
  id: string;
  size: WireSize;
  count: number;
  isPigtail: boolean; // Pigtails originating & ending inside box count as 0 per NEC 314.16(B)(1)
  description?: string;
}

export interface CableType {
  id: string;
  name: string;
  shortLabel: string;
  category: 'nm' | 'mc' | 'ac' | 'uf';
  size: WireSize;
  insulatedCount: number; // Current-carrying + neutral conductors inside the jacket
  hasEgc: boolean;
  egcSize: WireSize;
  clampsTypical: boolean; // Cable normally landed with an internal clamp in a metal box
  note?: string;
}

export interface CableEntry {
  id: string;
  cableTypeId: string;
  quantity: number; // Number of this cable entering the box
  description?: string;
}

export type DeviceType = 'receptacle' | 'switch' | 'gfci' | 'dimmer' | 'smart_switch' | 'double_gang_device' | 'triple_gang_device';

export interface DeviceEntry {
  id: string;
  type: DeviceType;
  gangs: number; // Number of strap widths (1 for standard, 2 for 2-gang device)
  wireSizeConnected: WireSize; // NEC 314.16(B)(4) based on largest conductor connected
  description?: string;
}

export interface BoxCategory {
  id: string;
  name: string;
  type: 'metal_standard' | 'nonmetallic_standard' | 'custom';
}

export interface StandardBox {
  id: string;
  name: string;
  tradeSize: string;
  category: 'octagonal_round' | 'square_4in' | 'square_4_11_16in' | 'device_box' | 'handy_fs' | 'nonmetallic_gang' | 'masonry';
  volumeCuIn: number;
  volumeCm3: number;
  depthInches?: number;
  description?: string;
}

export interface ExtensionRing {
  id: string;
  name: string;
  volumeCuIn: number;
}

export type NecEdition = '2023' | '2020' | '2017';

export interface BoxFillInputs {
  necEdition: NecEdition;
  // Box selection
  boxType: 'standard' | 'custom';
  selectedStandardBoxId: string;
  customDimensions: {
    width: number;
    height: number;
    depth: number;
    customVolumeCuIn?: number;
  };
  extensionRingId: string;
  customExtensionVolume: number;

  // Cables (expanded into conductors + EGCs before the NEC math runs)
  cables: CableEntry[];

  // Conductors
  conductors: ConductorEntry[];

  // Hardware allowances
  hasInternalClamps: boolean; // 1 allowance based on largest conductor in box
  clampWireSize: WireSize;

  hasSupportFittings: boolean; // 1 allowance based on largest conductor in box (fixture studs/hickeys)
  supportFittingWireSize: WireSize;

  // Grounding Conductors (NEC 314.16(B)(5))
  egcCount: number; // Total equipment grounding conductors entering box
  largestEgcSize: WireSize;
  hasIsolatedGrounds: boolean;

  // Devices & Straps (NEC 314.16(B)(4))
  devices: DeviceEntry[];
}

export interface VolumeBreakdownItem {
  category: 'conductors' | 'clamps' | 'support' | 'devices' | 'grounding';
  label: string;
  necRef: string;
  allowanceCount: number;
  wireSizeUsed: WireSize;
  volumePerAllowance: number;
  totalVolumeCuIn: number;
  details: string;
}

export interface BoxSuggestion {
  boxId: string;
  boxName: string;
  extensionRingId: string;
  extensionRingName: string;
  totalVolumeCuIn: number;
  fillPercentage: number;
  headroomCuIn: number;
  reason: 'overfilled' | 'tight';
}

export interface CalculationResult {
  totalRequiredVolumeCuIn: number;
  totalRequiredVolumeCm3: number;
  boxCapacityCuIn: number;
  boxCapacityCm3: number;
  extensionVolumeCuIn: number;
  totalAvailableVolumeCuIn: number;
  totalAvailableVolumeCm3: number;
  fillPercentage: number;
  isCompliant: boolean;
  excessVolumeCuIn: number; // Positive = headroom, Negative = overflow
  breakdown: VolumeBreakdownItem[];
  largestConductorInBox: WireSize;
  egcCountFromCables: number;
  totalEgcCount: number;
  suggestions: BoxSuggestion[];
  warnings: string[];
  recommendations: string[];
}

export interface WiringPreset {
  id: string;
  title: string;
  description: string;
  category: 'Residential' | 'Commercial' | 'Specialty';
  inputs: Partial<BoxFillInputs>;
}

export interface SavedJob {
  id: string;
  label: string;
  savedAt: string; // ISO timestamp
  inputs: BoxFillInputs;
}
