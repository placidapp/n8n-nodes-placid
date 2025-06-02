> **⚠️ BETA PREVIEW**  
> This is a **beta preview** release (v0.0.1-beta.1) of the Placid n8n community node.  
> While the core functionality is working, expect potential changes and improvements in upcoming releases.  
> Use in production environments at your own discretion.  
> 
> 📝 **Feedback welcome!** Report issues or suggestions via the repository.

# n8n-nodes-placid

This is an n8n community node. It lets you use [Placid API](https://placid.app) in your n8n workflows.

Placid is a powerful API service for automated image, PDF, and video generation from custom templates. Create dynamic visual content at scale with simple API calls.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Image Operations
- **Create Image** - Generate images from Placid templates with dynamic data
- **Get Image** - Retrieve image information and download URLs
- **Delete Image** - Delete generated images from your Placid account

### PDF Operations  
- **Create PDF** - Generate PDFs from Placid templates with dynamic data
- **Get PDF** - Retrieve PDF information and download URLs
- **Delete PDF** - Delete generated PDFs from your Placid account

### Video Operations
- **Create Video** - Generate videos from Placid templates with support for multiple clips and audio
- **Get Video** - Retrieve video information and download URLs
- **Delete Video** - Delete generated videos from your Placid account

### Template Operations
- **Create Template** - Create new Placid templates
- **Get Template** - Retrieve a specific template by ID
- **Get Many Templates** - List all templates with optional filtering
- **Update Template** - Update existing template properties
- **Delete Template** - Delete templates from your Placid account

### Other Operations
- **Upload Media** - Upload media files to Placid storage for use in templates

## Credentials

To use this node, you'll need:

1. **Placid Account**: Sign up at [placid.app](https://placid.app)
2. **API Key**: Get your API key from your Placid dashboard
3. **Authentication Setup**: 
   - In n8n, create new credentials of type "Placid API"
   - Enter your Placid API key

## Compatibility

- **Minimum n8n version**: 0.208.0
- **Node.js version**: >=20.15
- **Tested with**: n8n 1.x.x
 

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Placid API Documentation](https://placid.app/docs/2.0/introduction)

## Version history

### 0.0.1-beta.1 (Current)
- Initial beta release
- Image, PDF, and video generation from Placid templates
- Template management (CRUD operations)
- Media upload functionality
- Dynamic template field generation
- API key authentication
 