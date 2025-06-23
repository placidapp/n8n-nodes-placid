import { INodeProperties } from 'n8n-workflow';
import { createDynamicLayerConfigurationFields } from '../../utils/layerUtils';

export const imageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['image'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Generate a new image from a template',
				action: 'Create an image from a template',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve an existing image by ID',
				action: 'Get an image by ID',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an existing image by ID',
				action: 'Delete an image by ID',
			},
		],
		default: 'create',
	},
];

export const imageFields: INodeProperties[] = [
	// ===== TEMPLATE SELECTION =====
	{
		displayName: 'Template',
		name: 'template_id',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'Select the Placid template to use for image generation',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['create'],
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

	// ===== LAYER CONTENT SECTION =====
	{
		displayName: 'Configuration Mode',
		name: 'configurationMode',
		type: 'options',
		options: [
			{
				name: 'Simple',
				value: 'simple',
				description: 'Use form fields to configure layers',
			},
			{
				name: 'Advanced',
				value: 'advanced',
				description: 'Define layers using JSON',
			},
		],
		default: 'simple',
		description: 'Choose how you want to configure the template layers',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['create'],
			},
		},
	},

	// ===== DYNAMIC LAYER CONFIGURATION =====
	...createDynamicLayerConfigurationFields(
		'image',
		'create', 
		'configurationMode',
		'Layers',
		'layerItems',
		'Add Layer'
	),

	{
		displayName: 'Layers (JSON)',
		name: 'layersJson',
		type: 'json',
		default: '{}',
		description: 'Define all layer modifications as a JSON object. Example: {"title": {"text": "Hello World"}, "image": {"image": "https://example.com/photo.jpg"}}.',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['create'],
				configurationMode: ['advanced'],
			},
		},
		typeOptions: {
			rows: 10,
		},
	},

	// ===== ADDITIONAL OPTIONS =====
	{
		displayName: 'Additional Options',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['image'],
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
				description: 'Webhook URL to receive the image when generation is complete',
			},
			{
				displayName: 'Passthrough Data',
				name: 'passthrough',
				type: 'string',
				default: '',
				placeholder: 'Any custom data (max 1024 characters)',
				description: 'Custom data that will be included in webhook responses and requests for this image',
			},
		],
	},

	// ===== GET OPERATION FIELDS =====
	{
		displayName: 'Image ID',
		name: 'imageId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g., 12345',
		description: 'The unique ID of the image to retrieve',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['get'],
			},
		},
	},

	// ===== DELETE OPERATION FIELDS =====
	{
		displayName: 'Image ID',
		name: 'imageId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g., 12345',
		description: 'The unique ID of the image to delete',
		displayOptions: {
			show: {
				resource: ['image'],
				operation: ['delete'],
			},
		},
	},
]; 