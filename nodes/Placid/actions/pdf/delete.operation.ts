import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const pdfId = this.getNodeParameter('pdfId', i) as string;
	
	if (!pdfId) {
		throw new Error('PDF ID is required');
	}
	
	const options = {
		method: 'DELETE' as IHttpRequestMethods,
		url: `https://api.placid.app/api/rest/pdfs/${pdfId}`,
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
			message: `PDF ${pdfId} deleted successfully`,
			id: pdfId,
		},
	};
} 