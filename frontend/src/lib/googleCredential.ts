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
          getNotDisplayedReason?: () => string;
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
        }
      }
    });
  });
};
