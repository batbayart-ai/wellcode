export interface PacketaPoint {
  id: string;
  name: string;
  nameStreet: string;
  place: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  currency: string;
  carrierId?: string;
  carrierPickupPointId?: string;
}

declare global {
  interface Window {
    Packeta: {
      Widget: {
        pick: (
          apiKey: string,
          callback: (point: PacketaPoint | null) => void,
          options?: PacketaWidgetOptions
        ) => void;
        close: () => void;
      };
    };
  }
}

export interface PacketaWidgetOptions {
  country?: string;
  language?: string;
  carriers?: string;
  weight?: number;
}

export const PACKETA_WIDGET_URL =
  "https://widget.packeta.com/v6/www/js/library.js";
