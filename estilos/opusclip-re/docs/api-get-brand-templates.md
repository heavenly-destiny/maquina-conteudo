> ## Documentation Index
> Fetch the complete documentation index at: https://help.opus.pro/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Brand Templates

> Retrieve a list of brand templates available for your organization.

### Introduction

The `GET /api/brand-templates` endpoint returns a list of brand templates that are available for use in your projects. Each template is associated with a unique ID that you can use to reference it in your project.

### Request Parameters

* `q` (required): Query type, must be `mine`.

### Example

```bash theme={"dark"}
curl --request GET \
  --url 'https://api.opus.pro/api/brand-templates?q=mine' \
  --header 'Authorization: <API_KEY>'
```

> [!TIP]
>
> Ensure you replace `API_KEY` with your actual API key.

### Playground

> [card] [Generate Code Snippet](https://help.opus.pro/api-reference/playground/get-brand-templates.md)
>
> You can use this code generator to generate code snippets easily.

### Response Schema

> [card] [API Response Schema](https://help.opus.pro/api-reference/schemas/brand-template-representation)
>
> For more details of response, please refer to the API response schema.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.