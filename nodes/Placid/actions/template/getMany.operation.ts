import { IExecuteFunctions, INodeExecutionData, NodeOperationError, IHttpRequestMethods } from 'n8n-workflow';

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	try {
		const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
		const additionalFields = this.getNodeParameter('additionalFields', index, {}) as {
			collection_id?: string;
		};

		let allTemplates: any[] = [];
		let nextUrl: string | null = null;

		// Build initial URL
		const queryParams = new URLSearchParams();
		if (additionalFields.collection_id) {
			queryParams.append('collection_id', additionalFields.collection_id);
		}

		const baseUrl = 'https://api.placid.app/api/rest/templates';
		let currentUrl = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;

		do {
			const options = {
				method: 'GET' as IHttpRequestMethods,
				url: currentUrl,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
			};

			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', options);

			// Parse Placid API response structure
			let templates: any[] = [];
			if (response.data && Array.isArray(response.data)) {
				templates = response.data;
			} else if (Array.isArray(response)) {
				// Fallback if response is directly an array
				templates = response;
			} else {
				throw new NodeOperationError(this.getNode(), 'Unexpected response format from Placid API', {
					itemIndex: index,
				});
			}

			allTemplates = allTemplates.concat(templates);

			// Check for next page using Placid's pagination structure
			nextUrl = null;
			if (response.links && response.links.next) {
				nextUrl = response.links.next;
			}

			// If returnAll is false, only fetch the first page
			if (!returnAll) {
				break;
			}

			// Update URL for next iteration
			if (nextUrl) {
				currentUrl = nextUrl;
			}

		} while (nextUrl && returnAll);

		// Return the results as separate items
		return allTemplates.map(template => ({
			json: template,
		}));

	} catch (error) {
		throw new NodeOperationError(this.getNode(), `Failed to list templates: ${error.message}`, {
			itemIndex: index,
		});
	}
} 