import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { PlacidConfig } from '../../utils/config';

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const imageId = this.getNodeParameter('imageId', i) as string;
	
	if (!imageId) {
		throw new Error('Image ID is required');
	}
	
	const options = {
		method: 'DELETE' as IHttpRequestMethods,
		url: `${PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.IMAGES)}/${imageId}`,
		headers: {
			'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
			'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
			'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
		},
	};

	await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', options);
	
	// Return success response since DELETE returns 204 No Content
	return {
		json: {
			success: true,
			message: `Image ${imageId} deleted successfully`,
			id: imageId,
		},
	};
} 