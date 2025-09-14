![Placid n8n Integration](https://placid.app/assets/n8n/github-header-n8n.jpg)

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

### Quick Install
```bash
npm install n8n-nodes-placid
```

### Community Node Installation
Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Complete Setup Guide  
📖 **New to Placid + n8n?** Check out our comprehensive [Placid n8n Setup Guide](https://placid.app/help/n8n-setup-guide) with step-by-step instructions, examples, and best practices for:
- Setting up your Placid project with n8n integration
- Creating dynamic templates for images, PDFs, and videos  
- Installing and configuring the node
- Mapping data to template layers
- Testing and completing your workflows

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

## Usage

### Configuration Modes
The Placid node offers two configuration modes for maximum flexibility:

**🎯 Simple Mode (Recommended)**  
- User-friendly interface with dropdowns and form fields
- Dynamic template layer detection - template layers automatically become input fields
- Support for binary file uploads (images, videos, PDFs)
- Perfect for most use cases

**⚙️ Advanced Mode**  
- Direct JSON configuration for complex scenarios
- Full control over API payload structure  
- Support for multi-clip videos and advanced layer configurations
- Ideal for developers and complex automations

### Key Features

**📁 Binary File Upload**  
Upload files directly from n8n binary data:
- Images (JPG, PNG, GIF, WebP) for image and picture layers
- Videos (MP4) for video layers and video generation
- Automatic upload to Placid storage with instant URL generation

**🎬 Multi-Clip Videos**  
Create sophisticated videos:
- Combine multiple templates into single videos  
- Add audio tracks with trimming controls
- Support for image arrays and slideshow effects
- Layer animations and transitions

**🔄 Dynamic Template Integration**  
- Template layers automatically appear as configurable fields
- Support for all layer types: text, images, shapes, barcodes, ratings
- Custom properties for advanced styling
- Real-time template validation

### Quick Start Example
1. **Choose Resource**: Select "Image", "PDF", "Video", "Template", or "Other"
2. **Select Operation**: Pick "Create", "Get", "Delete", etc.  
3. **Pick Template**: Choose from your Placid templates
4. **Configure Layers**: Use the simple UI or JSON mode
5. **Add Data**: Map your n8n workflow data to template fields
6. **Execute**: Generate your creative asset

For detailed examples and walkthroughs, see the [📖 Placid n8n Setup Guide](https://placid.app/help/n8n-setup-guide).

## Resources

### Getting Started
* [📖 Placid n8n Setup Guide](https://placid.app/help/n8n-setup-guide) - Complete walkthrough with examples
* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

### API Documentation  
* [Placid API Documentation](https://placid.app/docs/2.0/introduction)
* [Placid Image API](https://placid.app/docs/2.0/rest/images)
* [Placid PDF API](https://placid.app/docs/2.0/rest/pdfs)  
* [Placid Video API](https://placid.app/docs/2.0/rest/videos)
* [Placid Templates API](https://placid.app/docs/2.0/rest/templates)

### Support & Community
* [📝 Report Issues](https://github.com/placidapp/n8n-nodes-placid/issues)
* [💬 Get Help](https://placid.app/help) - Contact Placid support
* [🔗 Repository](https://github.com/placidapp/n8n-nodes-placid)

## Version history

### 0.1.2 (Current)
- **n8n Cloud Verification Fix** 🔧
- Fixed ESLint violations by replacing `setTimeout` with n8n's `sleep` helper
- Ensures compatibility with n8n cloud verification requirements

### 0.1.1
- **Documentation improvements** 📚
- Added comprehensive usage examples and feature documentation
- Added reference to [Placid n8n Setup Guide](https://placid.app/help/n8n-setup-guide)
- Enhanced installation instructions with npm command
- Documented binary file upload capabilities
- Added support and community links

### 0.1.0
- **First stable release** 🎉
- Image, PDF, and video generation from Placid templates
- Template management (CRUD operations)
- Media upload functionality
- Dynamic template field generation
- API key authentication
- Production ready

### 0.0.1-beta.1
- Initial beta release
 