import { IExecuteFunctions, INodeExecutionData, NodeOperationError, IHttpRequestMethods } from 'n8n-workflow';

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData> {
	try {
		const templateId = this.getNodeParameter('templateId', index) as string;
		const updateFields = this.getNodeParameter('updateFields', index, {}) as {
			title?: string;
			tags?: string;
			custom_data?: string;
		};

		if (!templateId) {
			throw new NodeOperationError(this.getNode(), 'Template ID is required', {
				itemIndex: index,
			});
		}

		// Build request body with only provided fields
		const body: any = {};

		if (updateFields.title) {
			body.title = updateFields.title;
		}

		if (updateFields.tags) {
			body.tags = updateFields.tags.split(',').map(tag => tag.trim());
		}

		if (updateFields.custom_data !== undefined) {
			body.custom_data = updateFields.custom_data;
		}

		// Check if there are any fields to update
		if (Object.keys(body).length === 0) {
			throw new NodeOperationError(this.getNode(), 'At least one field must be provided for update', {
				itemIndex: index,
			});
		}

		const options = {
			method: 'PATCH' as IHttpRequestMethods,
			url: `https://api.placid.app/api/rest/templates/${templateId}`,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body,
		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', options);

		return {
			json: response,
		};
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to update template: ${error.message}`, {
			itemIndex: index,
		});
	}
} 