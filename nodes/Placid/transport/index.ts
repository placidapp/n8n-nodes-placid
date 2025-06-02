import { IExecuteFunctions, ILoadOptionsFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';
import { PlacidConfig } from '../utils/config';

const BASE_URL = 'https://api.placid.app/api/integromat';

export async function placidApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
): Promise<any> {
	const options = {
		method,
		url: `${BASE_URL}${endpoint}`,
		body,
	};

	return await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', options);
}

export const requestDefaults = {
	baseURL: BASE_URL,
	headers: {
		Accept: PlacidConfig.HTTP.HEADERS.ACCEPT,
		'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
		'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
	},
}; 