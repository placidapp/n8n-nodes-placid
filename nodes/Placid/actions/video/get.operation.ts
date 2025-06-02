import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { PlacidConfig } from '../../utils/config';

// Helper function to get video by ID - can be reused by create operation for polling
export async function getVideoById(executeFunctions: IExecuteFunctions, videoId: string): Promise<any> {
	const options = {
		method: 'GET' as IHttpRequestMethods,
		url: `${PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.VIDEOS)}/${videoId}`,
		headers: {
			'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
			'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
			'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
		},
	};

	return await executeFunctions.helpers.httpRequestWithAuthentication.call(executeFunctions, 'placidApi', options);
}

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const videoId = this.getNodeParameter('videoId', i) as string;
	
	if (!videoId) {
		throw new Error('Video ID is required');
	}
	
	const response = await getVideoById(this, videoId);
	
	return {
		json: response,
	};
} 