import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';

// Helper function to get image by ID - can be reused by create operation for polling
export async function getImageById(executeFunctions: IExecuteFunctions, imageId: string): Promise<any> {
	const options = {
		method: 'GET' as IHttpRequestMethods,
		url: `https://api.placid.app/api/rest/images/${imageId}`,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
	};

	return await executeFunctions.helpers.httpRequestWithAuthentication.call(executeFunctions, 'placidApi', options);
}

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const imageId = this.getNodeParameter('imageId', i) as string;
	
	if (!imageId) {
		throw new Error('Image ID is required');
	}
	
	const response = await getImageById(this, imageId);
	
	return {
		json: response,
	};
} 