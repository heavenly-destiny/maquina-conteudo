> ## Documentation Index
> Fetch the complete documentation index at: https://help.opus.pro/llms.txt
> Use this file to discover all available pages before exploring further.

# Create a New Project

> Submit a long-form video to create a new clipping project.

### Introduction

OpusClip identifies the most compelling hooks, extracts highlights from different parts of your video, and arranges them into viral shorts.

The body of the `POST /clip-projects` endpoint has 9 main components:

* [Video URL](https://help.opus.pro/api-reference/endpoints/create-project.md#video-url)
* [Brand Template Selection](https://help.opus.pro/api-reference/endpoints/create-project.md#brand-templates)
* [Curation Preferences](https://help.opus.pro/api-reference/endpoints/create-project.md#curation-preferences)
* [Render Preferences](https://help.opus.pro/api-reference/endpoints/create-project.md#render-preferences)
* [Import Preferences](https://help.opus.pro/api-reference/endpoints/create-project.md#import-preferences)
* [Conclusion Actions](https://help.opus.pro/api-reference/endpoints/create-project.md#conclusion-actions)
* [Curation Model](https://help.opus.pro/api-reference/endpoints/create-project.md#curation-model)
* [Uploaded Video Attributes](https://help.opus.pro/api-reference/endpoints/create-project.md#uploaded-video-attributes)
* [Response Schema](https://help.opus.pro/api-reference/endpoints/create-project.md#response-schema)

***

### Video URL

This parameter defines the URL of the long-form video. OpusClip can import public videos from the following platforms:

* `Apple Podcast`, `YouTube`, `Google Drive`, `Vimeo`, `Zoom`, `Zoom Clips`, `Rumble`, `Twitch`, `Facebook`, `LinkedIn`, `X`, `Dropbox`, `Riverside`, `Loom`, `Frame.io`, `StreamYard`, [Medal.tv](https://medal.tv/)
* Any public video S3 link of an MP4 file

```bash theme={"dark"}
curl --request POST \
  --url https://api.opus.pro/api/clip-projects \
  --header 'Authorization: Bearer <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
  "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes"
}'
```

> [!TIP]
>
> Ensure you replace `API_KEY` with your actual API key.

***

#### Brand Templates

We offer an option to customize the appearance of your clips by `brand template`.

* If a brand template is specified, relevant render preferences will be applied.
* It is recommended to define your brand templates within the OpusClip [dashboard](https://clip.opus.pro/dashboard) and set your default template.
* If a brand template not defined, the default template on your account will be used automatically.

> [card] [Customizing Brand Templates](https://help.opus.pro/api-reference/brand-template.md#customizing-brand-templates)
>
> For a high level of customization, you can create and manage your brand
> templates.

> [card] [Using Preset Brand Templates](https://help.opus.pro/api-reference/brand-template.md#using-preset-brand-templates)
>
> Not familiar with it? No worries, we provide popular templates for your
> convenience.

For example, to use the `Karaoke` brand template:

```bash theme={"dark"}
curl --request POST \
  --url https://api.opus.pro/api/clip-projects \
  --header 'Authorization Bearer <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
    "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
    "brandTemplateId": "preset-fancy-Karaoke"
  }'
```

> [!TIP]
>
> Ensure you replace `API_KEY` with your actual API key.

### Curation Preferences

Curation preferences define how your long-form video should be curated. Here you can define:

* The duration of the resulting clips
* The genre of the video
* Topic keywords that you want to prioritize clipping for
* The curation model you prefer to use
* Whether to add an AI-generated headline to your clips
* Whether to skip the clipping process entirely

> [card] [Curation Preferences Schema](https://help.opus.pro/api-reference/schemas/curation-preferences)
>
> Please refer to the curation preferences schema for more details.

> [!TIP]
>
> ✨ **New Feature: ClipAnything** ✨
>
> Curious to try **ClipAnything**? Click [here](https://help.opus.pro/api-reference/endpoints/create-project.md#curation-model) to learn more!
>
> You can also explore different examples by switching tabs between `ClipBasic` and `ClipAnything`.

> [!NOTE]
>
> **Skip Clipping**: You can bypass the clipping process entirely by setting `skipCurate: true` in your curation preferences. This is useful when you want to upload and process the original video without clipping it. We also support and will continue to maintain `skipSlicing: true` for the same purpose.
>
> ```json theme={"dark"}
> curationPref: {
>     skipCurate: true
> }
> ```

> [!NOTE]
>
> **`range` (optional)** restricts curation to a time window of the source
> video. When provided, both `startSec` and `endSec` are required, measured in
> **seconds**, with `startSec < endSec`. To clip the **whole video, omit
> `range` entirely** rather than sending an empty (`"range": {}`) or partial
> object.

> [!NOTE]
>
> **Auto headline**: `enableAutoHook` controls the AI-generated headline shown
> over the first seconds of a clip. It is **disabled by default** for projects
> created through the API — omit it, or send `false`, and no headline is added.
> Set it to `true` to opt in. It only applies to a clipping run, so it has no
> effect together with `skipCurate` or `skipSlicing`.
>
> ```json theme={"dark"}
> curationPref: {
>     enableAutoHook: true
> }
> ```

> [!NOTE]
>
> **`forceStrategy` (optional, advanced)** pins curation to an explicit
> strategy instead of letting OpusClip auto-select one for your video.
> [Talk to our support team](https://www.opus.pro/contact-support) to learn how
> to use it.

Example:

```bash ClipBasic theme={"dark"}
curl --request POST \
  --url https://api.opus.pro/api/clip-projects \
  --header 'Authorization: Bearer <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
  "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
  "uploadedVideoAttr": {
    "title": "AI Agents: The Future of Work?"
  },
  "curationPref": {
    "model":"ClipBasic",
    "clipDurations": [
     [
        0,
        180
      ]
    ],
    "genre": "Auto",
    "topicKeywords": [
      "OpusClip"
    ],
    "range": {
      "startSec": 105,
      "endSec": 300
    }
  }
}'
```

```bash ClipAnything theme={"dark"}
curl --request POST \
  --url https://api.opus.pro/api/clip-projects \
  --header 'Authorization: Bearer <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
  "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
  "uploadedVideoAttr": {
    "title": "AI Agents: The Future of Work?"
  },
  "curationPref": {
    "model":"ClipAnything",
    "clipDurations": [
     [
        0,
        90
      ]
    ],
    "genre": "Auto",
    "customPrompt": "OpusClip",
    "range": {
      "startSec": 105,
      "endSec": 300
    }
  }
}'
```

```bash Skip Clipping theme={"dark"}
curl --request POST \
  --url https://api.opus.pro/api/clip-projects \
  --header 'Authorization: Bearer <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
  "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
  "uploadedVideoAttr": {
    "title": "AI Agents: The Future of Work?"
  },
  "curationPref": {
    "skipCurate": true
  }
}'
```

> [!TIP]
>
> Ensure you replace `API_KEY` with your actual API key.

***

### Render Preferences

Render preferences allow you to customize how your clips are rendered, including layout options, caption settings, and audio processing features.

#### Layout Aspect Ratio

You can initiate a clip project and define the desired layout aspect ratio (such as portrait, landscape, square) by including it in the renderPref field of your request to the Opus API.
Example:

```bash theme={"dark"}
curl --request POST \
  --url https://api.opus.pro/api/clip-projects \
  --header 'Authorization: Bearer <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
    "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
    "uploadedVideoAttr": {
      "title": "AI Agents: The Future of Work?"
    },
    "renderPref": {
      "layoutAspectRatio": "square"
    }
  }'
```

#### Remove Filler Words

You can automatically remove filler words (such as "um", "uh", "like", etc.) from your video clips to create cleaner, more professional content. This feature is available via the Quickstart API configuration.

Example:

```bash theme={"dark"}
curl --request POST \
  --url https://api.opus.pro/api/clip-projects \
  --header 'Authorization: Bearer <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
    "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
    "uploadedVideoAttr": {
      "title": "AI Agents: The Future of Work?"
    },
    "renderPref": {
      "quickstartConfig": {
        "enableRemoveFillerWords": true
      }
    }
  }'
```

> [!TIP]
>
> Ensure you replace `API_KEY` with your actual API key.

***

### Import Preferences

Import preferences let you define the language of the original video. OpusClip supports videos in `20+ languages`.

By default, the video language is automatically detected.
It is recommended that if your video is not in English, you should specify the language.

> [card] [Video Languages Supported](https://help.opus.pro/docs/article/video-languages-supported.md)
>
> Please refer to the list of supported languages.

Example

```bash theme={"dark"}
curl --request POST \
  --url https://api.opus.pro/api/clip-projects \
  --header 'Authorization: Bearer <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
  "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
  "uploadedVideoAttr": {
    "title": "AI Agents: The Future of Work?"
  },
  "importPreference": {
    "sourceLang": "de"
  }
}'
```

> [!TIP]
>
> Ensure you replace `API_KEY` with your actual API key.
>
> Ensure you fill in `sourceLang` with language code.

***

### Conclusion Actions

Conclusion actions allow you to call a webhook or email a specific person when your results are ready.

> [!TIP]
>
> You can explore different examples of using webhooks or email notifications by
> switching tabs below.

> [!NOTE]
>
> Every `WEBHOOK` delivery is signed with the `X-Opus-Signature`, `X-Opus-Salt`, and
> `X-Opus-Timestamp` headers so your server can confirm it genuinely came from Opus. Verify the
> signature before trusting the payload — see [**Securing your webhook**](https://help.opus.pro/api-reference/webhook.md#securing-your-webhook).

```bash Webhook theme={"dark"}
curl --request POST \
--url https://api.opus.pro/api/clip-projects \
--header 'Authorization: Bearer <API_KEY>' \
--header 'Content-Type: application/json' \
--data '{
    "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
    "uploadedVideoAttr": {
      "title": "AI Agents: The Future of Work?"
    },
    "conclusionActions": [
{
    "type": "WEBHOOK",
    "notifyFailure": true,
    "url": "https://webhook.site/#!/view/d3ba169d-f9eb-4c78-a229-771eab9d6e67"
}
    ]
}'
```

```bash Email theme={"dark"}
curl --request POST \
--url https://api.opus.pro/api/clip-projects \
--header 'Authorization: Bearer <API_KEY>' \
    --header 'Content-Type: application/json' \
    --data '{
        "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
        "uploadedVideoAttr": {
          "title": "AI Agents: The Future of Work?"
        },
        "conclusionActions": [
    {
        "type": "EMAIL",
        "notifyFailure": false,
        "email": "opusclip@opus.pro"
    }
        ]
    }'
```

```bash Both theme={"dark"}
curl --request POST \
--url https://api.opus.pro/api/clip-projects \
--header 'Authorization: Bearer <API_KEY>' \
    --header 'Content-Type: application/json' \
    --data '{
        "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
        "uploadedVideoAttr": {
          "title": "AI Agents: The Future of Work?"
        },
        "conclusionActions": [
    {
        "type": "WEBHOOK",
        "notifyFailure": true,
        "url": "https://webhook.site/#!/view/d3ba169d-f9eb-4c78-a229-771eab9d6e67"
    },
    {
        "type": "EMAIL",
        "notifyFailure": false,
        "email": "opusclip@opus.pro"
    }
        ]
    }'
```

> [!TIP]
>
> Ensure you replace `API_KEY` with your actual API key.

***

### Curation Model

Curate video clips using either `ClipBasic` or `ClipAnything`, depending on your needs.

* `ClipBasic` is optimized for **talking-head videos**, providing precise scene selection.
* `ClipAnything` is our most **advanced and versatile** model, capable of extracting key moments from **any video type**, including vlogs, sports, TV shows, behind-the-scenes footage, news, music videos, and more.

When to Use `ClipAnything`?

> `ClipAnything` is ideal when you need advanced scene selection beyond talking-head videos. It utilizes **multimodal reasoning, natural language prompts, and deep scene analysis** to curate the most relevant moments based on **objects, actions, emotions, and genre**.

For more information about `ClipAnything`, refer to the link below.

> [card] [What is ClipAnything](https://help.opus.pro/docs/article/9947095-clip-anything.md)
>
> Explore the ClipAnything wiki for more details.

Model Selection & Parameters

> By default, `ClipBasic` is used. To switch to `ClipAnything`, update your **Curation Preferences**.
>
> * The `topicKeywords` parameter is **only applicable to `ClipBasic`**.
> * The `customPrompt` parameter is **exclusively available with `ClipAnything`**.

For details on configuring curation settings, refer to the link below.

> [card] [Curation Preferences Schema](https://help.opus.pro/api-reference/schemas/curation-preferences)
>
> View the curation preferences schema for more details.

Example:

> You can explore different examples of using `ClipBasic` and `ClipAnything` by switching tabs below.

```bash ClipBasic theme={"dark"}
curl --request POST \
  --url https://api.opus.pro/api/clip-projects \
  --header 'Authorization: Bearer <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
  "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
  "uploadedVideoAttr": {
    "title": "AI Agents: The Future of Work?"
  },
  "curationPref": {
    "model":"ClipBasic",
    "clipDurations": [
     [
        0,
        180
      ]
    ],
    "genre": "Auto",
    "topicKeywords": [
        "OpusClip"
    ]
  }
}'
```

```bash ClipAnything theme={"dark"}
curl --request POST \
  --url https://api.opus.pro/api/clip-projects \
  --header 'Authorization: Bearer <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
  "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
  "uploadedVideoAttr": {
    "title": "AI Agents: The Future of Work?"
  },
  "curationPref": {
    "model":"ClipAnything",
    "clipDurations": [
     [
        0,
        90
      ]
    ],
    "genre": "Auto",
    "customPrompt": "Compile all the hilarious moments",
  }
}'
```

### Playground

> [card] [Generate Code Snippet](https://help.opus.pro/api-reference/playground/create-project.md)
>
> You can use this code generator to generate code snippets easily.

***

### Uploaded Video Attributes

You can set custom attributes for your uploaded video, including a custom title for your project.

* `title`: Set a custom title for your clipping project

Example:

```bash theme={"dark"}
curl --request POST \
  --url https://api.opus.pro/api/clip-projects \
  --header 'Authorization: Bearer <API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
  "videoUrl": "https://www.youtube.com/watch?v=tEXaoozFRes",
  "uploadedVideoAttr": {
    "title": "YOUR_TITLE"
  }
}'
```

> [!TIP]
>
> Ensure you replace `API_KEY` with your actual API key and `YOUR_TITLE` with
> your desired project title.

***

### Response Schema

> [card] [API Response Schema](https://help.opus.pro/api-reference/schemas/project-representation)
>
> For more details of response, please refer to the API response schema.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.