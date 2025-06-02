import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const videoId = this.getNodeParameter('videoId', i) as string;
	
	if (!videoId) {
		throw new Error('Video ID is required');
	}
	
	const options = {
		method: 'DELETE' as IHttpRequestMethods,
		url: `https://api.placid.app/api/rest/videos/${videoId}`,
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
			message: `Video ${videoId} deleted successfully`,
			id: videoId,
		},
	};
} 