import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { PlacidConfig } from '../../utils/config';

// Helper function to get image by ID - can be reused by create operation for polling
export async function getImageById(executeFunctions: IExecuteFunctions, imageId: string): Promise<any> {
	const options = {
		method: 'GET' as IHttpRequestMethods,
		url: `${PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.IMAGES)}/${imageId}`,
		headers: {
			'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
			'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
			'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
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