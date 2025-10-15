import { IExecuteFunctions, INodeExecutionData, NodeOperationError, IHttpRequestMethods } from 'n8n-workflow';
import { PlacidConfig } from '../../utils/config';

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData> {
	try {
		const templateId = this.getNodeParameter('templateId', index) as string;

		if (!templateId) {
			throw new NodeOperationError(this.getNode(), 'Template ID is required', {
				itemIndex: index,
			});
		}

		const options = {
			method: 'GET' as IHttpRequestMethods,
			url: `${PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.TEMPLATES)}/${templateId}`,
			headers: {
				'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
				'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
				'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
			},
		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', options);

		// The Placid API returns a single template object directly
		return {
			json: response,
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to get template: ${error.message}`, {
			itemIndex: index,
		});
	}
} 