// This file adds TypeScript definitions for the experimental Window Management API.

declare global {
  /**
   * Extends the built-in PermissionName type to include "window-management".
   * This fixes: Type '"window-management"' is not assignable to type 'PermissionName'.
   */
  type PermissionName =
    | "accelerometer"
    | "ambient-light-sensor"
    | "background-fetch"
    | "background-sync"
    | "bluetooth"
    | "camera"
    | "clipboard-read"
    | "clipboard-write"
    | "device-info"
    | "display-capture"
    | "gamepad"
    | "geolocation"
    | "gyroscope"
    | "magnetometer"
    | "microphone"
    | "midi"
    | "nfc"
    | "notifications"
    | "persistent-storage"
    | "push"
    | "screen-wake-lock"
    | "storage-access"
    | "usb"
    | "window-management"; // <-- This is the line you're adding

  /**
   * Adds getScreenDetails() to the Window interface.
   * This fixes: Property 'getScreenDetails' does not exist on type 'Window'.
   */
  interface Window {
    getScreenDetails(): Promise<ScreenDetails>;
  }

  /**
   * Defines the return type for getScreenDetails().
   */
  interface ScreenDetails {
    screens: ScreenDetailed[];
    currentScreen: ScreenDetailed;

    // Event handlers
    oncurrentscreenchange: ((this: ScreenDetails, ev: Event) => any) | null;
    onscreenschange: ((this: ScreenDetails, ev: Event) => any) | null;
    addEventListener(
      type: 'currentscreenchange' | 'screenschange',
      listener: (this: ScreenDetails, ev: Event) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
      type: 'currentscreenchange' | 'screenschange',
      listener: (this: ScreenDetails, ev: Event) => any,
      options?: boolean | EventListenerOptions
    ): void;
  }

  /**
   * Defines the detailed screen information.
   */
  interface ScreenDetailed extends Screen {
    availLeft: number;
    availTop: number;
    isInternal: boolean;
    isPrimary: boolean;
    label: string;
    devicePixelRatio: number;
  }
}

// This export statement turns the file into a module,
// which is necessary for the 'declare global' block to work.
export {};