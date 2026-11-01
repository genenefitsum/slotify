/**
 * Imperative, themed alert — a drop-in for React Native's `Alert.alert` so call
 * sites read the same: `showAlert(title, message?, buttons?)`. A single
 * `<AlertHost />` mounted at the root renders the actual popup.
 */

export type SlotAlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type SlotAlertButton = {
  text: string;
  style?: SlotAlertButtonStyle;
  onPress?: () => void;
};

export type SlotAlertOptions = {
  title: string;
  message?: string;
  buttons?: SlotAlertButton[];
};

type Listener = (options: SlotAlertOptions) => void;

let hostListener: Listener | null = null;

/** The AlertHost registers itself here on mount (and clears on unmount). */
export function registerAlertHost(listener: Listener | null): void {
  hostListener = listener;
}

/** Show a themed alert. Mirrors `Alert.alert(title, message?, buttons?)`. */
export function showAlert(
  title: string,
  message?: string,
  buttons?: SlotAlertButton[]
): void {
  hostListener?.({ title, message, buttons });
}
