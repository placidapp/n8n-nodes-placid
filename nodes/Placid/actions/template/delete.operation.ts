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
			method: 'DELETE' as IHttpRequestMethods,
			url: `${PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.TEMPLATES)}/${templateId}`,
			headers: {
				'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
				'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
				'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
			},
		};

		await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', options);

		return {
			json: {
				success: true,
				templateId,
				message: 'Template deleted successfully'
			},
			pairedItem: { item: index },
		};
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to delete template: ${error.message}`, {
			itemIndex: index,
		});
	}
} 