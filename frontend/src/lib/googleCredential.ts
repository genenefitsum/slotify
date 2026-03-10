const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

type GoogleWindow = Window & {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential?: string }) => void;
          ux_mode?: 'popup' | 'redirect';
        }) => void;
        prompt: (callback?: (notification: {
          isNotDisplayed?: () => boolean;
          isSkippedMoment?: () => boolean;
          isDismissedMoment?: () => boolean;
          getNotDisplayedReason?: () => string;
          getSkippedReason?: () => string;
          getDismissedReason?: () => string;
        }) => void) => void;
        cancel: () => void;
      };
    };
  };
};

const loadGoogleScript = async (): Promise<GoogleWindow['google']> => {
  const scopedWindow = window as GoogleWindow;

  if (scopedWindow.google?.accounts?.id) {
    return scopedWindow.google;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-google-gsi="true"]');

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In.'));
    document.head.appendChild(script);
  });

  if (!scopedWindow.google?.accounts?.id) {
    throw new Error('Google Sign-In is currently unavailable.');
  }

  return scopedWindow.google;
};

export const requestGoogleCredential = async (clientId: string): Promise<string> => {
  if (!clientId.trim()) {
    throw new Error('Google sign-in is not configured for this app.');
  }

  const google = await loadGoogleScript();

  return new Promise<string>((resolve, reject) => {
    if (!google?.accounts?.id) {
      reject(new Error('Google Sign-In is currently unavailable.'));
      return;
    }

    // Quick probe to catch strict popup blockers before initializing GIS.
    const popupProbe = window.open('', '_blank', 'popup,width=1,height=1');
    if (!popupProbe) {
      reject(new Error('Popup blocked by browser settings. Allow popups for this site and retry.'));
      return;
    }
    popupProbe.close();

    let settled = false;
    const timeoutId = window.setTimeout(() => {
      fail('Google sign-in popup was blocked or unavailable. Please allow popups and try again.');
    }, 20000);

    const succeed = (credential: string) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      resolve(credential);
    };

    const fail = (message: string) => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      reject(new Error(message));
    };

    google.accounts.id.cancel();
    google.accounts.id.initialize({
      client_id: clientId,
      ux_mode: 'popup',
      callback: (response) => {
        if (settled) {
          return;
        }

        const credential = String(response?.credential || '').trim();

        if (!credential) {
          fail('Google sign-in was cancelled.');
          return;
        }

        succeed(credential);
      },
    });

    google.accounts.id.prompt((notification) => {
      if (notification?.isNotDisplayed?.()) {
        const reason = notification.getNotDisplayedReason?.();

        if (reason === 'browser_not_supported' || reason === 'invalid_client') {
          fail('Google sign-in is unavailable in this browser/client configuration.');
          return;
        }

        if (reason === 'unregistered_origin') {
          fail('Google OAuth origin is not authorized. Add your frontend URL to Authorized JavaScript origins.');
          return;
        }

        if (reason) {
          fail(`Google sign-in could not be shown (${reason}).`);
          return;
        }
      }

      if (notification?.isSkippedMoment?.()) {
        const reason = notification.getSkippedReason?.();

        if (reason === 'auto_cancel' || reason === 'user_cancel') {
          fail('Google sign-in was cancelled.');
          return;
        }

        if (reason === 'tap_outside') {
          fail('Google sign-in popup was dismissed before completion.');
          return;
        }

        if (reason) {
          fail(`Google sign-in was skipped (${reason}).`);
          return;
        }
      }

      if (notification?.isDismissedMoment?.()) {
        const reason = notification.getDismissedReason?.();

        if (reason === 'credential_returned') {
          return;
        }

        if (reason) {
          fail(`Google sign-in was dismissed (${reason}).`);
        }
      }
    });
  });
};
