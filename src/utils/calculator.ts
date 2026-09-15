import {
  BoxFillInputs,
  BoxSuggestion,
  CableEntry,
  CalculationResult,
  ConductorEntry,
  VolumeBreakdownItem,
  WireSize
} from '../types/nec';
import {
  CABLE_TYPES,
  NEC_CONDUCTOR_VOLUMES,
  STANDARD_BOXES,
  EXTENSION_RINGS,
  getLargerWireSize,
  isRingCompatible
} from '../data/necTables';

interface ExpandedCables {
  conductors: ConductorEntry[];
  egcCount: number;
  largestEgcSize: WireSize | null;
  clampAdvised: boolean;
  cableCount: number;
}

// Cables are an input convenience: each one expands into the insulated conductors
// it carries plus the equipment grounding conductor riding along with it, so the
// NEC math below never has to know cables exist.
export function expandCables(cables: CableEntry[] = []): ExpandedCables {
  const conductors: ConductorEntry[] = [];
  let egcCount = 0;
  let largestEgcSize: WireSize | null = null;
  let clampAdvised = false;
  let cableCount = 0;

  cables.forEach((entry) => {
    const type = CABLE_TYPES.find(t => t.id === entry.cableTypeId);
    if (!type || entry.quantity <= 0) return;

    cableCount += entry.quantity;

    conductors.push({
      id: `cable-${entry.id}`,
      size: type.size,
      count: type.insulatedCount * entry.quantity,
      isPigtail: false,
      description: entry.description
        ? `${entry.quantity}x ${type.shortLabel} — ${entry.description}`
        : `${entry.quantity}x ${type.name}`
    });

    if (type.hasEgc) {
      egcCount += entry.quantity;
      largestEgcSize = largestEgcSize
        ? getLargerWireSize(largestEgcSize, type.egcSize)
        : type.egcSize;
    }

    if (type.clampsTypical) clampAdvised = true;
  });

  return { conductors, egcCount, largestEgcSize, clampAdvised, cableCount };
}

// Walks the standard box + extension ring catalog for the smallest assemblies that
// hold the required volume, so an overfilled result can name the fix instead of
// only describing the failure.
export function findBoxSuggestions(
  requiredVolumeCuIn: number,
  currentBoxId: string,
  currentRingId: string,
  reason: 'overfilled' | 'tight'
): BoxSuggestion[] {
  if (requiredVolumeCuIn <= 0) return [];

  const rings = EXTENSION_RINGS.filter(r => r.id !== 'custom');
  const candidates: BoxSuggestion[] = [];

  STANDARD_BOXES.forEach((box) => {
    rings.forEach((ring) => {
      if (!isRingCompatible(box, ring.id)) return;
      if (box.id === currentBoxId && ring.id === currentRingId) return;

      const totalVolumeCuIn = Math.round((box.volumeCuIn + ring.volumeCuIn) * 100) / 100;
      if (totalVolumeCuIn < requiredVolumeCuIn) return;

      candidates.push({
        boxId: box.id,
        boxName: box.name,
        extensionRingId: ring.id,
        extensionRingName: ring.name,
        totalVolumeCuIn,
        fillPercentage: Math.round((requiredVolumeCuIn / totalVolumeCuIn) * 100),
        headroomCuIn: Math.round((totalVolumeCuIn - requiredVolumeCuIn) * 100) / 100,
        reason
      });
    });
  });

  // Prefer assemblies that leave working room; fall back to anything that merely fits.
  const comfortable = candidates.filter(c => c.fillPercentage <= 85);
  const pool = comfortable.length > 0 ? comfortable : candidates;

  pool.sort((a, b) => {
    if (a.totalVolumeCuIn !== b.totalVolumeCuIn) return a.totalVolumeCuIn - b.totalVolumeCuIn;
    // At equal volume, the single-piece assembly is the simpler install.
    if (a.extensionRingId === 'none' && b.extensionRingId !== 'none') return -1;
    if (b.extensionRingId === 'none' && a.extensionRingId !== 'none') return 1;
    return 0;
  });

  const seenVolumes = new Set<number>();
  const suggestions: BoxSuggestion[] = [];
  pool.forEach((candidate) => {
    if (suggestions.length >= 3) return;
    if (seenVolumes.has(candidate.totalVolumeCuIn)) return;
    seenVolumes.add(candidate.totalVolumeCuIn);
    suggestions.push(candidate);
  });

  return suggestions;
}

export function calculateBoxFill(inputs: BoxFillInputs): CalculationResult {
  const breakdown: VolumeBreakdownItem[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Track the overall largest conductor present in the box for clamps & support fittings
  let largestConductorInBox: WireSize = '14';

  // 0. CABLE EXPANSION — cables become conductors + grounds before any NEC math runs
  const cables = expandCables(inputs.cables);
  const allConductors = [...cables.conductors, ...(inputs.conductors || [])];
  const totalEgcCount = (inputs.egcCount || 0) + cables.egcCount;

  // 1. CONDUCTORS VOLUME (NEC 314.16(B)(1))
  let totalConductorVolume = 0;
  allConductors.forEach((cond) => {
    if (cond.count > 0 && !cond.isPigtail) {
      largestConductorInBox = getLargerWireSize(largestConductorInBox, cond.size);
      const unitVol = NEC_CONDUCTOR_VOLUMES[cond.size]?.cuIn || 2.0;
      const subtotal = cond.count * unitVol;
      totalConductorVolume += subtotal;

      breakdown.push({
        category: 'conductors',
        label: `${cond.count}x ${cond.size} AWG Wires`,
        necRef: 'NEC 314.16(B)(1)',
        allowanceCount: cond.count,
        wireSizeUsed: cond.size,
        volumePerAllowance: unitVol,
        totalVolumeCuIn: subtotal,
        details: cond.description || `${cond.count} conductors entering box`
      });
    }
  });

  // Check largest wire in grounds
  const largestEgcSize: WireSize = cables.largestEgcSize
    ? getLargerWireSize(inputs.largestEgcSize, cables.largestEgcSize)
    : inputs.largestEgcSize;

  if (totalEgcCount > 0) {
    largestConductorInBox = getLargerWireSize(largestConductorInBox, largestEgcSize);
  }
  // Check largest wire in devices
  inputs.devices.forEach(d => {
    largestConductorInBox = getLargerWireSize(largestConductorInBox, d.wireSizeConnected);
  });

  // 2. CLAMPS ALLOWANCE (NEC 314.16(B)(2))
  let clampVolume = 0;
  if (inputs.hasInternalClamps) {
    const clampWireSize = inputs.clampWireSize || largestConductorInBox;
    const unitVol = NEC_CONDUCTOR_VOLUMES[clampWireSize]?.cuIn || 2.0;
    clampVolume = unitVol;

    breakdown.push({
      category: 'clamps',
      label: 'Internal Cable Clamps',
      necRef: 'NEC 314.16(B)(2)',
      allowanceCount: 1,
      wireSizeUsed: clampWireSize,
      volumePerAllowance: unitVol,
      totalVolumeCuIn: unitVol,
      details: `1 allowance based on largest conductor (${clampWireSize} AWG)`
    });
  }

  // 3. SUPPORT FITTINGS ALLOWANCE (NEC 314.16(B)(3))
  let supportVolume = 0;
  if (inputs.hasSupportFittings) {
    const supportWireSize = inputs.supportFittingWireSize || largestConductorInBox;
    const unitVol = NEC_CONDUCTOR_VOLUMES[supportWireSize]?.cuIn || 2.0;
    supportVolume = unitVol;

    breakdown.push({
      category: 'support',
      label: 'Fixture Stud / Hickey',
      necRef: 'NEC 314.16(B)(3)',
      allowanceCount: 1,
      wireSizeUsed: supportWireSize,
      volumePerAllowance: unitVol,
      totalVolumeCuIn: supportVolume,
      details: `1 allowance based on largest conductor (${supportWireSize} AWG)`
    });
  }

  // 4. DEVICE / STRAP ALLOWANCE (NEC 314.16(B)(4))
  let deviceVolume = 0;
  inputs.devices.forEach((dev) => {
    const wireSize = dev.wireSizeConnected || largestConductorInBox;
    const unitVol = NEC_CONDUCTOR_VOLUMES[wireSize]?.cuIn || 2.0;
    const allowances = dev.gangs * 2; // Double volume per gang width
    const devSubtotal = allowances * unitVol;
    deviceVolume += devSubtotal;

    breakdown.push({
      category: 'devices',
      label: `${dev.description || dev.type.toUpperCase()} (${dev.gangs}-gang)`,
      necRef: 'NEC 314.16(B)(4)',
      allowanceCount: allowances,
      wireSizeUsed: wireSize,
      volumePerAllowance: unitVol,
      totalVolumeCuIn: devSubtotal,
      details: `${allowances} allowances (${dev.gangs} gang x 2) @ ${unitVol} cu in (${wireSize} AWG)`
    });
  });

  // 5. EQUIPMENT GROUNDING CONDUCTORS (NEC 314.16(B)(5))
  let groundingVolume = 0;
  if (totalEgcCount > 0) {
    const egcSize = largestEgcSize || largestConductorInBox;
    const unitVol = NEC_CONDUCTOR_VOLUMES[egcSize]?.cuIn || 2.0;

    // Up to 4 EGCs = 1 allowance
    let totalGroundAllowances = 1;
    if (totalEgcCount > 4) {
      // 0.25 allowance per extra EGC over 4
      const extraGrounds = totalEgcCount - 4;
      totalGroundAllowances = 1 + (extraGrounds * 0.25);
    }

    if (inputs.hasIsolatedGrounds) {
      totalGroundAllowances += 1; // 1 additional allowance for isolated ground
    }

    groundingVolume = totalGroundAllowances * unitVol;

    const sourceNote = cables.egcCount > 0
      ? ` (${cables.egcCount} from cables + ${inputs.egcCount || 0} entered manually)`
      : '';

    breakdown.push({
      category: 'grounding',
      label: `Equipment Grounding Wires (${totalEgcCount} EGCs)`,
      necRef: 'NEC 314.16(B)(5)',
      allowanceCount: totalGroundAllowances,
      wireSizeUsed: egcSize,
      volumePerAllowance: unitVol,
      totalVolumeCuIn: groundingVolume,
      details: totalEgcCount <= 4
        ? `1 allowance for ${totalEgcCount} grounds @ ${unitVol} cu in (${egcSize} AWG)${sourceNote}`
        : `1 + ${totalEgcCount - 4}x0.25 = ${totalGroundAllowances} allowances @ ${unitVol} cu in${sourceNote}`
    });
  }

  // TOTAL REQUIRED VOLUME
  const totalRequiredVolumeCuIn = Math.round((
    totalConductorVolume +
    clampVolume +
    supportVolume +
    deviceVolume +
    groundingVolume
  ) * 100) / 100;

  const totalRequiredVolumeCm3 = Math.round(totalRequiredVolumeCuIn * 16.3871);

  // BOX CAPACITY CALCULATION
  let boxCapacityCuIn = 0;
  if (inputs.boxType === 'standard') {
    const box = STANDARD_BOXES.find(b => b.id === inputs.selectedStandardBoxId);
    boxCapacityCuIn = box ? box.volumeCuIn : 21.0;
  } else {
    // Custom volume calculation (Width x Height x Depth)
    if (inputs.customDimensions.customVolumeCuIn && inputs.customDimensions.customVolumeCuIn > 0) {
      boxCapacityCuIn = inputs.customDimensions.customVolumeCuIn;
    } else {
      const { width, height, depth } = inputs.customDimensions;
      boxCapacityCuIn = Math.round((width * height * depth) * 10) / 10;
    }
  }

  // Extension / Mud ring volume
  let extensionVolumeCuIn = 0;
  if (inputs.extensionRingId === 'custom') {
    extensionVolumeCuIn = inputs.customExtensionVolume || 0;
  } else if (inputs.extensionRingId && inputs.extensionRingId !== 'none') {
    const ext = EXTENSION_RINGS.find(r => r.id === inputs.extensionRingId);
    extensionVolumeCuIn = ext ? ext.volumeCuIn : 0;
  }

  const totalAvailableVolumeCuIn = Math.round((boxCapacityCuIn + extensionVolumeCuIn) * 100) / 100;
  const totalAvailableVolumeCm3 = Math.round(totalAvailableVolumeCuIn * 16.3871);

  // COMPLIANCE STATUS
  const fillPercentage = totalAvailableVolumeCuIn > 0 
    ? Math.round((totalRequiredVolumeCuIn / totalAvailableVolumeCuIn) * 100) 
    : 0;

  const isCompliant = totalRequiredVolumeCuIn <= totalAvailableVolumeCuIn;
  const excessVolumeCuIn = Math.round((totalAvailableVolumeCuIn - totalRequiredVolumeCuIn) * 100) / 100;

  // WARNINGS & RECOMMENDATIONS
  if (!isCompliant) {
    warnings.push(`Box is overfilled by ${Math.abs(excessVolumeCuIn).toFixed(1)} cu in (${fillPercentage}% fill capacity).`);
    recommendations.push('Upgrade to a deeper box or add a plaster/mud extension ring.');
    recommendations.push('Consider splitting conductors into a separate junction box.');
  } else if (fillPercentage > 85) {
    warnings.push(`Box is near capacity (${fillPercentage}% filled). Wiring may be tight during installation.`);
    recommendations.push('Consider using a deeper box for easier wire folding and heat dissipation.');
  }

  if (allConductors.length === 0) {
    warnings.push('No insulated conductors have been added to the calculation.');
  }

  if (cables.clampAdvised && !inputs.hasInternalClamps) {
    warnings.push('Cable entries typically land on internal clamps — enable the clamp allowance if clamps sit inside the box.');
  }

  if (inputs.hasInternalClamps && cables.cableCount > 1) {
    recommendations.push(`Clamps count once for all ${cables.cableCount} cables, not per cable — NEC 314.16(B)(2).`);
  }

  // Name the smallest assemblies that would actually hold this fill
  const suggestions = (!isCompliant || fillPercentage > 85)
    ? findBoxSuggestions(
        totalRequiredVolumeCuIn,
        inputs.boxType === 'standard' ? inputs.selectedStandardBoxId : '',
        inputs.extensionRingId,
        isCompliant ? 'tight' : 'overfilled'
      )
    : [];

  return {
    totalRequiredVolumeCuIn,
    totalRequiredVolumeCm3,
    boxCapacityCuIn,
    boxCapacityCm3: Math.round(boxCapacityCuIn * 16.3871),
    extensionVolumeCuIn,
    totalAvailableVolumeCuIn,
    totalAvailableVolumeCm3,
    fillPercentage,
    isCompliant,
    excessVolumeCuIn,
    breakdown,
    largestConductorInBox,
    egcCountFromCables: cables.egcCount,
    totalEgcCount,
    suggestions,
    warnings,
    recommendations
  };
}
