import React from 'react';
import { DeviceEntry, DeviceType, WireSize } from '../types/nec';
import { WIRE_SIZE_ORDER, NEC_CONDUCTOR_VOLUMES } from '../data/necTables';
import { Smartphone, Plus, Trash2 } from 'lucide-react';

interface DeviceFormProps {
  devices: DeviceEntry[];
  onChange: (updated: DeviceEntry[]) => void;
  unit: 'imperial' | 'metric';
}

export const DeviceForm: React.FC<DeviceFormProps> = ({ devices, onChange, unit }) => {
  const addDevice = (type: DeviceType = 'receptacle') => {
    const defaultName = type === 'receptacle' ? 'Duplex Receptacle'
      : type === 'gfci' ? 'GFCI Receptacle'
      : type === 'dimmer' ? 'Dimmer Switch'
      : type === 'smart_switch' ? 'Smart Switch'
      : type === 'double_gang_device' ? '2-Gang Wide Device'
      : 'Single-Pole Switch';

    const newDevice: DeviceEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      type,
      gangs: type === 'double_gang_device' ? 2 : type === 'triple_gang_device' ? 3 : 1,
      wireSizeConnected: '12',
      description: defaultName
    };
    onChange([...devices, newDevice]);
  };

  const updateDevice = (id: string, field: keyof DeviceEntry, value: any) => {
    onChange(devices.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const removeDevice = (id: string) => {
    onChange(devices.filter(d => d.id !== id));
  };

  return (
    <div className="glass rounded-3xl p-6 border border-zinc-800 space-y-5">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Yokes &amp; Strap Devices</span>
              <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full font-mono">
                {devices.length} Devices
              </span>
            </h3>
            <p className="text-xs text-zinc-400">NEC 314.16(B)(4) — Double volume allowance per gang width</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => addDevice('receptacle')}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Device
        </button>
      </div>

      {/* Quick Device Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-zinc-400 font-medium mr-1">Quick Add:</span>
        <button
          type="button"
          onClick={() => addDevice('receptacle')}
          className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 px-2.5 py-1 rounded-lg transition-all"
        >
          + Receptacle
        </button>
        <button
          type="button"
          onClick={() => addDevice('switch')}
          className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 px-2.5 py-1 rounded-lg transition-all"
        >
          + Toggle Switch
        </button>
        <button
          type="button"
          onClick={() => addDevice('gfci')}
          className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 px-2.5 py-1 rounded-lg transition-all"
        >
          + GFCI Outlet
        </button>
        <button
          type="button"
          onClick={() => addDevice('dimmer')}
          className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 px-2.5 py-1 rounded-lg transition-all"
        >
          + Smart Dimmer
        </button>
      </div>

      {/* Device List */}
      {devices.length === 0 ? (
        <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-5 text-center text-zinc-500 text-xs">
          No devices/straps added. Click "+ Add Device" if switches or receptacles are mounted in this box.
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((d) => {
            const unitVol = NEC_CONDUCTOR_VOLUMES[d.wireSizeConnected]?.cuIn || 2.25;
            const allowances = d.gangs * 2;
            const subtotal = allowances * unitVol;

            return (
              <div
                key={d.id}
                className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all flex flex-wrap items-center justify-between gap-4"
              >
                {/* Device Type & Description */}
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[10px] text-zinc-400 font-semibold block mb-1">DEVICE DESCRIPTION</label>
                  <input
                    type="text"
                    value={d.description || ''}
                    onChange={(e) => updateDevice(d.id, 'description', e.target.value)}
                    placeholder="Device Name..."
                    className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Gang Width */}
                <div className="w-24">
                  <label className="text-[10px] text-zinc-400 font-semibold block mb-1">GANG WIDTH</label>
                  <select
                    value={d.gangs}
                    onChange={(e) => updateDevice(d.id, 'gangs', parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm font-semibold font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>1-Gang</option>
                    <option value={2}>2-Gang</option>
                    <option value={3}>3-Gang</option>
                  </select>
                </div>

                {/* Connected Wire Size */}
                <div className="w-32">
                  <label className="text-[10px] text-zinc-400 font-semibold block mb-1">CONNECTED WIRE</label>
                  <select
                    value={d.wireSizeConnected}
                    onChange={(e) => updateDevice(d.id, 'wireSizeConnected', e.target.value as WireSize)}
                    className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3 py-2 text-sm font-semibold font-mono focus:outline-none focus:border-indigo-500"
                  >
                    {WIRE_SIZE_ORDER.map(sz => (
                      <option key={sz} value={sz}>{sz} AWG</option>
                    ))}
                  </select>
                </div>

                {/* Volume Subtotal */}
                <div className="text-right min-w-[80px]">
                  <span className="text-[10px] text-zinc-500 block">ALLOWANCE</span>
                  <span className="text-sm font-mono font-bold text-indigo-400">
                    {allowances}x ({subtotal.toFixed(2)} cu in)
                  </span>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeDevice(d.id)}
                  className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
