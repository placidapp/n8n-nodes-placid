import { INodeProperties } from 'n8n-workflow';
import { createDynamicLayerConfigurationFields } from '../../utils/layerUtils';

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
				name: 'Merge',
				value: 'merge',
				description: 'Merge multiple existing PDFs into one',
				action: 'Merge multiple PDF files',
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
				description: 'Single-page PDF with template selection and form fields',
			},
			{
				name: 'Advanced',
				value: 'advanced',
				description: 'Multi-page PDF using JSON array configuration',
			},
		],
		default: 'simple',
		description: 'Choose how you want to configure the PDF generation',
		displayOptions: {
			show: {
				resource: ['pdf'],
				operation: ['create'],
			},
		},
	},

	// ===== SIMPLE MODE: SINGLE-PAGE CONFIGURATION (like Image action) =====
	{
		displayName: 'Template',
		name: 'template_id',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'Select the Placid template to use for PDF generation',
		displayOptions: {
			show: {
				resource: ['pdf'],
				operation: ['create'],
				configurationMode: ['simple'],
			},
		},
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

	// ===== DYNAMIC LAYER CONFIGURATION (like Image action) =====
	...createDynamicLayerConfigurationFields(
		'pdf',
		'create', 
		'configurationMode',
		'Layers',
		'layerItems',
		'Add Layer'
	),

	// ===== ADVANCED MODE: MULTI-PAGE JSON CONFIGURATION =====
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

	// ===== MERGE OPERATION: CONFIGURATION MODE =====
	{
		displayName: 'Configuration Mode',
		name: 'configurationMode',
		type: 'options',
		options: [
			{
				name: 'Simple',
				value: 'simple',
				description: 'Configure PDFs via form fields',
			},
			{
				name: 'Advanced',
				value: 'advanced',
				description: 'Specify URLs as JSON array',
			},
		],
		default: 'simple',
		description: 'Choose how you want to configure the PDF merge',
		displayOptions: {
			show: {
				resource: ['pdf'],
				operation: ['merge'],
			},
		},
	},

	// ===== MERGE OPERATION: PDF SOURCES (Simple Mode) =====
	{
		displayName: 'PDF Sources',
		name: 'pdfSources',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		required: true,
		description: 'PDF files to merge (2-10 sources required). You can mix URLs and binary files.',
		displayOptions: {
			show: {
				resource: ['pdf'],
				operation: ['merge'],
				configurationMode: ['simple'],
			},
		},
		options: [
			{
				name: 'sources',
				displayName: 'Sources',
				values: [
					{
						displayName: 'Source Type',
						name: 'sourceType',
						type: 'options',
						options: [
							{
								name: 'URL',
								value: 'url',
							},
							{
								name: 'PDF File (Binary)',
								value: 'binary',
								description: 'Upload a PDF file directly from binary data',
							},
						],
						default: 'url',
						description: 'Choose whether to provide a URL or binary file',
					},
					{
						displayName: 'URL',
						name: 'url',
						type: 'string',
						default: '',
						placeholder: 'https://example.com/document.pdf',
						description: 'URL of a PDF file to merge',
						displayOptions: {
							show: {
								sourceType: ['url'],
							},
						},
					},
					{
						displayName: 'Binary Field',
						name: 'binaryField',
						type: 'string',
						default: 'data',
						placeholder: 'data',
						description: 'Name of the binary field containing the PDF file',
						displayOptions: {
							show: {
								sourceType: ['binary'],
							},
						},
					},
				],
			},
		],
	},

	// ===== MERGE OPERATION: URLS JSON (Advanced Mode) =====
	{
		displayName: 'URLs (JSON)',
		name: 'urlsJson',
		type: 'json',
		default: '[]',
		required: true,
		description: 'JSON array of PDF URLs to merge (2-10 URLs). Example: ["https://example.com/doc1.pdf", "https://example.com/doc2.pdf"].',
		displayOptions: {
			show: {
				resource: ['pdf'],
				operation: ['merge'],
				configurationMode: ['advanced'],
			},
		},
		typeOptions: {
			rows: 10,
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
				operation: ['create', 'merge'],
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