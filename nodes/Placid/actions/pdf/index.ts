import { INodeProperties } from 'n8n-workflow';
import { createNestedLayerFields } from '../../utils/layerUtils';

export const pdfOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pdf'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Generate a new PDF from a template',
				action: 'Create a PDF from a template',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve an existing PDF by ID',
				action: 'Get a PDF by ID',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an existing PDF by ID',
				action: 'Delete a PDF by ID',
			},
		],
		default: 'create',
	},
];

export const pdfFields: INodeProperties[] = [
	// ===== MULTI-PAGE CONFIGURATION =====
	{
		displayName: 'Configuration Mode',
		name: 'configurationMode',
		type: 'options',
		options: [
			{
				name: 'Simple',
				value: 'simple',
				description: 'Use form fields to configure pages and layers',
			},
			{
				name: 'Advanced',
				value: 'advanced',
				description: 'Define pages and layers using JSON',
			},
		],
		default: 'simple',
		description: 'Choose how you want to configure the PDF pages and layers',
		displayOptions: {
			show: {
				resource: ['pdf'],
				operation: ['create'],
			},
		},
	},

	// ===== SIMPLE MODE: MULTI-PAGE CONFIGURATION =====
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'fixedCollection',
		default: { pageItems: [] },
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['pdf'],
				operation: ['create'],
				configurationMode: ['simple'],
			},
		},
		options: [
			{
				name: 'pageItems',
				displayName: 'Add Page',
				values: [
					{
						displayName: 'Template',
						name: 'template_id',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						required: true,
						description: 'Select the Placid template to use for this page',
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								typeOptions: {
									searchListMethod: 'getTemplates',
									searchable: true,
								},
							},
							{
								displayName: 'By ID',
								name: 'id',
								type: 'string',
								hint: 'Enter the template UUID directly',
								placeholder: 'e.g., gpsm5pn5n4tpz',
								extractValue: {
									type: 'regex',
									regex: '^(.*)$',
								},
							},
						],
					},
					// ===== UNIFIED LAYER CONFIGURATION FOR PAGES =====
					...createNestedLayerFields('pdf'),
				],
			},
		],
	},

	// ===== ADVANCED MODE: JSON CONFIGURATION =====
	{
		displayName: 'Pages (JSON)',
		name: 'pagesJson',
		type: 'json',
		default: '[]',
		description: 'Define all pages as a JSON array. Each page should have a template_uuid and layers object. Example: [{"template_uuid": "abc123", "layers": {"title": {"text": "Page 1"}}}, {"template_uuid": "def456", "layers": {"title": {"text": "Page 2"}}}]',
		displayOptions: {
			show: {
				resource: ['pdf'],
				operation: ['create'],
				configurationMode: ['advanced'],
			},
		},
		typeOptions: {
			rows: 15,
		},
	},

	// ===== OPTIONAL SETTINGS =====
	{
		displayName: 'Additional Options',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['pdf'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Webhook Success URL',
				name: 'webhook_success',
				type: 'string',
				default: '',
				placeholder: 'https://your-webhook.url',
				description: 'Webhook URL to receive the PDF when generation is complete',
			},
			{
				displayName: 'Passthrough Data',
				name: 'passthrough',
				type: 'string',
				default: '',
				placeholder: 'Any custom data (max 1024 characters)',
				description: 'Custom data that will be included in webhook responses and requests for this PDF',
			},
		],
	},

	// ===== GET OPERATION FIELDS =====
	{
		displayName: 'PDF ID',
		name: 'pdfId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g., 12345',
		description: 'The unique ID of the PDF to retrieve',
		displayOptions: {
			show: {
				resource: ['pdf'],
				operation: ['get'],
			},
		},
	},

	// ===== DELETE OPERATION FIELDS =====
	{
		displayName: 'PDF ID',
		name: 'pdfId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g., 12345',
		description: 'The unique ID of the PDF to delete',
		displayOptions: {
			show: {
				resource: ['pdf'],
				operation: ['delete'],
			},
		},
	},
]; 