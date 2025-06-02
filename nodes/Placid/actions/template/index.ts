import { INodeProperties } from 'n8n-workflow';

export const templateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['template'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new template',
				action: 'Create a template',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an existing template by ID',
				action: 'Delete a template by ID',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve an existing template by ID',
				action: 'Get a template by ID',
			},
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Retrieve multiple templates',
				action: 'Get many templates',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing template',
				action: 'Update a template',
			},
		],
		default: 'getMany',
	},
];

export const templateFields: INodeProperties[] = [
	// Get Many operation fields
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['getMany'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['getMany'],
			},
		},
		options: [
			{
				displayName: 'Collection ID',
				name: 'collection_id',
				type: 'string',
				default: '',
				description: 'Filter templates by collection ID',
			},
		],
	},

	// Get operation fields
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the template',
	},

	// Create operation fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The title of the template',
	},
	{
		displayName: 'Width',
		name: 'width',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['create'],
			},
		},
		default: 1200,
		description: 'The width of the template in pixels',
	},
	{
		displayName: 'Height',
		name: 'height',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['create'],
			},
		},
		default: 630,
		description: 'The height of the template in pixels',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
			},
			{
				displayName: 'Custom Data',
				name: 'custom_data',
				type: 'string',
				default: '',
				description: 'Custom data for the template',
			},
			{
				displayName: 'From Template',
				name: 'from_template',
				type: 'string',
				default: '',
				description: 'ID of template to copy from',
			},
			{
				displayName: 'Add to Collections',
				name: 'add_to_collections',
				type: 'string',
				default: '',
				description: 'Comma-separated list of collection IDs to add template to',
			},
		],
	},

	// Update operation fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the template',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
			},
			{
				displayName: 'Custom Data',
				name: 'custom_data',
				type: 'string',
				default: '',
				description: 'Custom data for the template',
			},
		],
	},
]; 