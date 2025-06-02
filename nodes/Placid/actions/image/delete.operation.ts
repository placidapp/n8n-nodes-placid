import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const imageId = this.getNodeParameter('imageId', i) as string;
	
	if (!imageId) {
		throw new Error('Image ID is required');
	}
	
	const options = {
		method: 'DELETE' as IHttpRequestMethods,
		url: `https://api.placid.app/api/rest/images/${imageId}`,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
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