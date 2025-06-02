import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';

// Helper function to get video by ID - can be reused by create operation for polling
export async function getVideoById(executeFunctions: IExecuteFunctions, videoId: string): Promise<any> {
	const options = {
		method: 'GET' as IHttpRequestMethods,
		url: `https://api.placid.app/api/rest/videos/${videoId}`,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
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