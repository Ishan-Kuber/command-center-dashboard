import { create } from "zustand";

export interface DeviceData {
  id: string;
  lat: number;
  lng: number;
  status: "online" | "offline" | "warning";
  telemetry: Record<string, unknown>;
}

interface CommandCenterState {
  devices: Record<string, DeviceData>;
  selectedDeviceId: string | null;
  updateDevice: (id: string, data: Partial<DeviceData>) => void;
  selectDevice: (id: string | null) => void;
}

export const useCommandCenterStore = create<CommandCenterState>((set) => ({
  devices: {},
  selectedDeviceId: null,
  updateDevice: (id: string, data: Partial<DeviceData>) =>
    set((state: CommandCenterState) => ({
      devices: {
        ...state.devices,
        [id]: {
          ...state.devices[id],
          ...data,
          id,
        },
      },
    })),
  selectDevice: (id: string | null) => set({ selectedDeviceId: id }),
}));