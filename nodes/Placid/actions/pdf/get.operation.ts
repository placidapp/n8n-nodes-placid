import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods, NodeOperationError } from 'n8n-workflow';
import { PlacidConfig } from '../../utils/config';

// Helper function to get PDF by ID - can be reused by create operation for polling
export async function getPdfById(executeFunctions: IExecuteFunctions, pdfId: string): Promise<any> {
	const options = {
		method: 'GET' as IHttpRequestMethods,
		url: `${PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.PDFS)}/${pdfId}`,
		headers: {
			'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
			'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
			'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
		},
	};

	return await executeFunctions.helpers.httpRequestWithAuthentication.call(executeFunctions, 'placidApi', options);
}

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const pdfId = this.getNodeParameter('pdfId', i) as string;
	
	if (!pdfId) {
		throw new NodeOperationError(this.getNode(), 'PDF ID is required');
	}
	
	const response = await getPdfById(this, pdfId);

	return {
		json: response,
		pairedItem: { item: i },
	};
} 