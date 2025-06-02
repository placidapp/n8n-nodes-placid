import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';

// Helper function to get PDF by ID - can be reused by create operation for polling
export async function getPdfById(executeFunctions: IExecuteFunctions, pdfId: string): Promise<any> {
	const options = {
		method: 'GET' as IHttpRequestMethods,
		url: `https://api.placid.app/api/rest/pdfs/${pdfId}`,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
	};

	return await executeFunctions.helpers.httpRequestWithAuthentication.call(executeFunctions, 'placidApi', options);
}

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const pdfId = this.getNodeParameter('pdfId', i) as string;
	
	if (!pdfId) {
		throw new Error('PDF ID is required');
	}
	
	const response = await getPdfById(this, pdfId);
	
	return {
		json: response,
	};
} 