import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

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
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.placid.app/api',
			url: '/n8n/auth',
			method: 'GET',
		},
	};
} 