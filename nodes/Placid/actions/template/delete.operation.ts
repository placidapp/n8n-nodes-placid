import { IExecuteFunctions, INodeExecutionData, NodeOperationError, IHttpRequestMethods } from 'n8n-workflow';

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
			url: `https://api.placid.app/api/rest/templates/${templateId}`,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		};

		await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', options);

		return {
			json: { 
				success: true, 
				templateId,
				message: 'Template deleted successfully'
			},
		};
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to delete template: ${error.message}`, {
			itemIndex: index,
		});
	}
} 