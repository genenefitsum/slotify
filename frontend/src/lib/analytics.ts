const GA_MEASUREMENT_ID = 'G-V8JESJ43N5';

const getGtag = () => {
	if (typeof window === 'undefined') {
		return undefined;
	}

	return (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
};

export const trackPageView = (pagePath: string) => {
	const gtag = getGtag();

	if (!gtag) {
		return;
	}

	gtag('config', GA_MEASUREMENT_ID, {
		page_path: pagePath,
	});
};