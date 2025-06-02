import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';
import { PlacidConfig } from '../nodes/Placid/utils/config';

export class PlacidApi implements ICredentialType {
	name = 'placidApi';
	displayName = 'Placid API';
	documentationUrl = 'https://placid.app/docs/2.0/introduction';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Your Placid API key. You can find this in your Placid account under Projects.',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: PlacidConfig.CREDENTIAL_TEST.BASE_URL,
			url: PlacidConfig.CREDENTIAL_TEST.ENDPOINT,
			method: 'GET',
		},
	};
} 