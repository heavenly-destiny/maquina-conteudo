> ## Documentation Index
> Fetch the complete documentation index at: https://help.opus.pro/llms.txt
> Use this file to discover all available pages before exploring further.

# Brand Template

## Customizing Brand Templates

**1. Manage brand template on dashboard**

> [card] [Customizing Brand Templates](https://clip.opus.pro/brand-templates)
>
> For a high level of customization, you can create and manage your brand template.

**2. Get a list of brand templates**

Send request to retrieve a list of brand templates.

```bash theme={"dark"}
curl --request GET \
--url https://api.opus.pro/api/brand-templates?q=mine \
--header 'Authorization: <API_KEY>'
```

Get id of the brand template you want to use.

```json theme={"dark"}
[
    {
        "templateId": "your-brand-template-id",
        "name": "Karaoke Template",
        ...other properties
    }
]
```

**3. Create project with brand template**

> [card] [Creating project with brand template](https://help.opus.pro/api-reference/endpoints/create-project.md#using-brand-templates)
>
> For a high level of customization, you can create and manage your brand template.

```bash theme={"dark"}
curl --request POST \
--url https://api.opus.pro/api/clip-projects \
--header 'Authorization Bearer <API_KEY>' \
--header 'Content-Type: application/json' \
--data '{
    "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
    "brandTemplateId": "your-brand-template-id"
}'
```

## Using Preset Brand Templates

We provide popular templates for your convenience.
You can directly use the id of the brand template you want to use.

> [!TIP]
>
> Preview below preset brand templates, pick the one you like and use the `id` in your project.

> [card] Karaoke
>
> <video autoPlay muted loop playsInline src="https://public.cdn.opus.pro/clip-web/videos/fancy-template-thumbnails/Karaoke-transcode.mp4" />
>
> id: **preset-fancy-Karaoke**

> [card] Gameplay
>
> <video autoPlay muted loop playsInline src="https://public.cdn.opus.pro/clip-web/videos/fancy-template-thumbnails/Gameplay-transcode.mp4" />
>
> id: **preset-fancy-Gameplay**

> [card] Beasty
>
> <video autoPlay muted loop playsInline src="https://public.cdn.opus.pro/clip-web/videos/fancy-template-thumbnails/Beasty-transcode.mp4" />
>
> id: **preset-fancy-Beasty**

> [card] Deep Diver
>
> <video autoPlay muted loop playsInline src="https://public.cdn.opus.pro/clip-web/videos/fancy-template-thumbnails/Deep-Diver-transcode.mp4" />
>
> id: **preset-fancy-Deep\_Diver**

> [card] Youshaei
>
> <video autoPlay muted loop playsInline src="https://public.cdn.opus.pro/clip-web/videos/fancy-template-thumbnails/Youshaei3-transcode.mp4" />
>
> id: **preset-fancy-Youshaei**

> [card] Pod\_P
>
> <video autoPlay muted loop playsInline src="https://public.cdn.opus.pro/clip-web/videos/fancy-template-thumbnails/Pod-P-transcode.mp4" />
>
> id: **preset-fancy-Pod\_P**

> [card] Mozi
>
> <video autoPlay muted loop playsInline src="https://public.cdn.opus.pro/clip-web/videos/fancy-template-thumbnails/Mozi-transcode.mp4" />
>
> id: **preset-fancy-Mozi**

> [card] Popline
>
> <video autoPlay muted loop playsInline src="https://public.cdn.opus.pro/clip-web/videos/fancy-template-thumbnails/Popline-transcode.mp4" />
>
> id: **preset-fancy-Popline**

> [card] Simple
>
> <video autoPlay muted loop playsInline src="https://public.cdn.opus.pro/clip-web/videos/fancy-template-thumbnails/Simple-transcode.mp4" />
>
> id: **preset-fancy-Simple**

> [card] Think Media
>
> <video autoPlay muted loop playsInline src="https://public.cdn.opus.pro/clip-web/videos/fancy-template-thumbnails/Think-Media-transcode.mp4" />
>
> id: **preset-fancy-Think\_Media**


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.