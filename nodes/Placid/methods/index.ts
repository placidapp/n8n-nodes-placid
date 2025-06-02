import { ILoadOptionsFunctions, INodePropertyOptions, INodeListSearchResult, IHttpRequestMethods } from 'n8n-workflow';
import { PlacidConfig } from '../utils/config';

export async function getTemplates(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {


	const returnData: INodePropertyOptions[] = [];
	
	// Use pagination token (next page URL) if provided, otherwise start with first page
	let url = paginationToken || PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.TEMPLATES);
	
	// Add search parameter if not already in pagination URL (for future Placid support)
	if (!paginationToken && filter) {
		url += `?search=${encodeURIComponent(filter)}`;
	}
	
	// Use the standard REST API endpoint for getting templates
	const options = {
		method: 'GET' as IHttpRequestMethods,
		url: url,
		headers: {
			'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
			'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
			'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
		},
	};

	const response = await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', options);

	
	if (response.data && Array.isArray(response.data)) {
		for (const template of response.data) {
			// Apply client-side filter if search term provided
			if (filter && !template.title.toLowerCase().includes(filter.toLowerCase())) {
				continue;
			}
			
			returnData.push({
				name: template.title,
				value: template.uuid,
				description: template.tags ? template.tags.join(', ') : '',
			});
		}
	}

	// Handle pagination - return next page URL if available
	const result: INodeListSearchResult = {
		results: returnData,
	};

	// Add pagination token for next page if available
	if (response.links && response.links.next) {
		result.paginationToken = response.links.next;
	}

	return result;
}

// Helper function to get layers for a specific template
async function getLayersForTemplate(loadOptionsFunctions: ILoadOptionsFunctions, templateId: string): Promise<INodePropertyOptions[]> {
	if (!templateId) {
		return [{ name: 'Please Select a Template First', value: '' }];
	}
	
	// Use the standard REST API endpoint for getting template details
	const options = {
		method: 'GET' as IHttpRequestMethods,
		url: `${PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.TEMPLATES)}/${templateId}`,
		headers: {
			'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
			'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
			'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
		},
	};

	const response = await loadOptionsFunctions.helpers.httpRequestWithAuthentication.call(loadOptionsFunctions, 'placidApi', options);
	
	const layers: INodePropertyOptions[] = [];
	
	if (response.layers && Array.isArray(response.layers)) {
		for (const layer of response.layers) {
			// Only include text and picture layers
			const layerType = layer.type || 'unknown';
			if (layerType === 'text' || layerType === 'picture') {
				const displayName = `${layer.name} (${layerType})`;
				
				layers.push({
					name: displayName,
					value: `${layer.name}|${layerType}`, // Encode both name and type in value
					description: `Layer type: ${layerType}`,
				});
			}
		}
	}
	
	return layers;
}

export async function getTemplateLayers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {

	
	// Try to get template_id from different possible locations
	let templateId: string | undefined;
	
	try {
		// First try: direct template_id parameter (for image operations)
		const templateIdParam = this.getNodeParameter('template_id', 0) as unknown as { value: string } | string;
		templateId = typeof templateIdParam === 'string' ? templateIdParam : templateIdParam?.value;
	} catch (error) {
		// Ignore error, template_id not found at top level

	}
	
	return await getLayersForTemplate(this, templateId || '');
}

export async function getTextLayers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const allLayers = await getTemplateLayers.call(this);
	return allLayers.filter(layer => String(layer.value).includes('|text'));
}

export async function getPictureLayers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const allLayers = await getTemplateLayers.call(this);
	return allLayers.filter(layer => String(layer.value).includes('|picture'));
}

// New methods specifically for PDF page layer loading
export async function getPdfPageTextLayers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {

	
	// For PDF pages, we need to provide a generic response since we can't reliably get the template_id
	// from the nested structure. Users will need to manually enter layer names or use advanced mode.
	return [
		{ name: 'Enter Layer Name Manually', value: 'manual', description: 'Type the layer name directly' },
		{ name: 'Use Advanced Mode for Complex Configurations', value: '', description: 'Switch to Advanced mode for full control' },
	];
}

export async function getPdfPagePictureLayers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {

	
	// For PDF pages, we need to provide a generic response since we can't reliably get the template_id
	// from the nested structure. Users will need to manually enter layer names or use advanced mode.
	return [
		{ name: 'Enter Layer Name Manually', value: 'manual', description: 'Type the layer name directly' },
		{ name: 'Use Advanced Mode for Complex Configurations', value: '', description: 'Switch to Advanced mode for full control' },
	];
} 