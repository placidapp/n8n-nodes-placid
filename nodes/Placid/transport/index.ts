import { IExecuteFunctions, ILoadOptionsFunctions, IDataObject, IHttpRequestMethods } from 'n8n-workflow';

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
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
}; 