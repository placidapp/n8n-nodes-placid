import { INodeType, INodeTypeDescription, IExecuteFunctions, INodeExecutionData, NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { requestDefaults } from './transport';
import { getTemplates, getTemplateLayers, getTextLayers, getPictureLayers, getPdfPageTextLayers, getPdfPagePictureLayers } from './methods';
import { imageOperations, imageFields } from './actions/image';
import { pdfOperations, pdfFields } from './actions/pdf';
import { videoOperations, videoFields } from './actions/video';
import { otherOperations, otherFields } from './actions/other';
import { templateOperations, templateFields } from './actions/template';
import * as imageCreate from './actions/image/create.operation';
import * as imageGet from './actions/image/get.operation';
import * as imageDelete from './actions/image/delete.operation';
import * as pdfCreate from './actions/pdf/create.operation';
import * as pdfGet from './actions/pdf/get.operation';
import * as pdfDelete from './actions/pdf/delete.operation';
import * as videoCreate from './actions/video/create.operation';
import * as videoGet from './actions/video/get.operation';
import * as videoDelete from './actions/video/delete.operation';
import * as otherUploadMedia from './actions/other/uploadMedia.operation';
import * as templateCreate from './actions/template/create.operation';
import * as templateGet from './actions/template/get.operation';
import * as templateGetMany from './actions/template/getMany.operation';
import * as templateUpdate from './actions/template/update.operation';
import * as templateDelete from './actions/template/delete.operation';

export class Placid implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Placid',
		name: 'placid',
		icon: 'file:placid.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Generate images, PDFs, and videos via Placid\'s API',
		defaults: {
			name: 'Placid',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'placidApi',
				required: true,
			},
		],
		requestDefaults,
		properties: [
			// Resources
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Image',
						value: 'image',
					},
					{
						name: 'Other',
						value: 'other',
					},
					{
						name: 'PDF',
						value: 'pdf',
					},
					{
						name: 'Template',
						value: 'template',
					},
					{
						name: 'Video',
						value: 'video',
					},
				],
				default: 'image',
			},
			// Operations and fields
			...imageOperations,
			...pdfOperations,
			...templateOperations,
			...videoOperations,
			...otherOperations,
			...imageFields,
			...pdfFields,
			...templateFields,
			...videoFields,
			...otherFields,
		],
	};

	methods = {
		listSearch: {
			getTemplates,
		},
		loadOptions: {
			getTemplateLayers,
			getTextLayers,
			getPictureLayers,
			getPdfPageTextLayers,
			getPdfPagePictureLayers,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		
		// Operation router for better maintainability
		const operationMap: {[key: string]: {[key: string]: any}} = {
			image: {
				create: imageCreate.execute,
				get: imageGet.execute,
				delete: imageDelete.execute,
			},
			pdf: {
				create: pdfCreate.execute,
				get: pdfGet.execute,
				delete: pdfDelete.execute,
			},
			video: {
				create: videoCreate.execute,
				get: videoGet.execute,
				delete: videoDelete.execute,
			},
			template: {
				create: templateCreate.execute,
				get: templateGet.execute,
				getMany: templateGetMany.execute,
				update: templateUpdate.execute,
				delete: templateDelete.execute,
			},
			other: {
				uploadMedia: otherUploadMedia.execute,
			},
		};
		
		const resourceOperations = operationMap[resource];
		if (!resourceOperations) {
			throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
		}
		
		const operationHandler = resourceOperations[operation];
		if (!operationHandler) {
			throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported for resource "${resource}"`);
		}
		
		for (let i = 0; i < items.length; i++) {
			if (operation === 'getMany') {
				// Handle operations that return multiple items
				const results = await operationHandler.call(this, i);
				returnData.push(...results);
			} else {
				// Handle operations that return single items
				const result = await operationHandler.call(this, i);
				returnData.push(result);
			}
		}
		
		return [returnData];
	}
} 