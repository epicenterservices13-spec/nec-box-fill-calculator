import {
  BoxFillInputs,
  CalculationResult,
  VolumeBreakdownItem,
  WireSize
} from '../types/nec';
import {
  NEC_CONDUCTOR_VOLUMES,
  STANDARD_BOXES,
  EXTENSION_RINGS,
  getLargerWireSize
} from '../data/necTables';

export function calculateBoxFill(inputs: BoxFillInputs): CalculationResult {
  const breakdown: VolumeBreakdownItem[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Track the overall largest conductor present in the box for clamps & support fittings
  let largestConductorInBox: WireSize = '14';

  // 1. CONDUCTORS VOLUME (NEC 314.16(B)(1))
  let totalConductorVolume = 0;
  inputs.conductors.forEach((cond) => {
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
  if (inputs.egcCount > 0) {
    largestConductorInBox = getLargerWireSize(largestConductorInBox, inputs.largestEgcSize);
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
      totalVolumeCuIn: unitVol,
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
  if (inputs.egcCount > 0) {
    const egcSize = inputs.largestEgcSize || largestConductorInBox;
    const unitVol = NEC_CONDUCTOR_VOLUMES[egcSize]?.cuIn || 2.0;
    
    // Up to 4 EGCs = 1 allowance
    let totalGroundAllowances = 1;
    if (inputs.egcCount > 4) {
      // 0.25 allowance per extra EGC over 4
      const extraGrounds = inputs.egcCount - 4;
      totalGroundAllowances = 1 + (extraGrounds * 0.25);
    }

    if (inputs.hasIsolatedGrounds) {
      totalGroundAllowances += 1; // 1 additional allowance for isolated ground
    }

    groundingVolume = totalGroundAllowances * unitVol;

    breakdown.push({
      category: 'grounding',
      label: `Equipment Grounding Wires (${inputs.egcCount} EGCs)`,
      necRef: 'NEC 314.16(B)(5)',
      allowanceCount: totalGroundAllowances,
      wireSizeUsed: egcSize,
      volumePerAllowance: unitVol,
      totalVolumeCuIn: groundingVolume,
      details: inputs.egcCount <= 4 
        ? `1 allowance for ${inputs.egcCount} grounds @ ${unitVol} cu in (${egcSize} AWG)`
        : `1 + ${inputs.egcCount - 4}x0.25 = ${totalGroundAllowances} allowances @ ${unitVol} cu in`
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

  if (inputs.conductors.length === 0) {
    warnings.push('No insulated conductors have been added to the calculation.');
  }

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
    warnings,
    recommendations
  };
}
