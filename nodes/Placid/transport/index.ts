import { PlacidConfig } from '../utils/config';

const BASE_URL = 'https://api.placid.app/api/integromat';

export const requestDefaults = {
	baseURL: BASE_URL,
	headers: {
		Accept: PlacidConfig.HTTP.HEADERS.ACCEPT,
		'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
		'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
	},
}; 