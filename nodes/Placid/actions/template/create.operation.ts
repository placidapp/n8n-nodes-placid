import { IExecuteFunctions, INodeExecutionData, NodeOperationError, IHttpRequestMethods } from 'n8n-workflow';
import { PlacidConfig } from '../../utils/config';

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData> {
	try {
		const title = this.getNodeParameter('title', index) as string;
		const width = this.getNodeParameter('width', index) as number;
		const height = this.getNodeParameter('height', index) as number;
		
		const additionalFields = this.getNodeParameter('additionalFields', index, {}) as {
			tags?: string;
			custom_data?: string;
			from_template?: string;
			add_to_collections?: string;
		};

		// Build request body
		const body: any = {
			title,
			width,
			height,
		};

		// Add optional fields
		if (additionalFields.tags) {
			body.tags = additionalFields.tags.split(',').map(tag => tag.trim());
		}

		if (additionalFields.custom_data) {
			body.custom_data = additionalFields.custom_data;
		}

		if (additionalFields.from_template) {
			body.from_template = additionalFields.from_template;
		}

		if (additionalFields.add_to_collections) {
			body.add_to_collections = additionalFields.add_to_collections.split(',').map(id => id.trim());
		}

		const options = {
			method: 'POST' as IHttpRequestMethods,
			url: PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.TEMPLATES),
			headers: {
				'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
				'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
				'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
			},
			body,
		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', options);

		return {
			json: response,
		};
	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to create template: ${error.message}`, {
			itemIndex: index,
		});
	}
} 