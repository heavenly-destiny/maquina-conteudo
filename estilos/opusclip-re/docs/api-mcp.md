> ## Documentation Index
> Fetch the complete documentation index at: https://help.opus.pro/llms.txt
> Use this file to discover all available pages before exploring further.

# OpusClip MCP Server

Connect OpusClip to an AI agent and work from natural-language prompts such as "clip this video" or "schedule this clip to post tomorrow at 9am."

Pro-tier API access is in **Beta**. The limits described on [Limitations](https://help.opus.pro/api-reference/limitation.md) apply to **Pro Beta** and **Max** unless noted otherwise. Business customers have API access per their contract.

This page covers the **MCP Server** (`mcp.opus.pro/mcp`) for Cursor, Cline, Claude Code, ChatGPT / Codex, and other MCP hosts. Using Claude.ai? Use the [Claude Connector](https://help.opus.pro/api-reference/claude-connector.md) instead. Prefer an API-key code package? See the [Skill](https://help.opus.pro/api-reference/skill.md).

**1. Install**

OpusClip runs as a **hosted MCP server** — nothing to install or run locally, and OAuth sign-in on first use (no API key):

```
https://mcp.opus.pro/mcp
```

The MCP Server exposes the full tool catalog, including thumbnail, speech, music, and video generation. (The [Claude Connector](https://help.opus.pro/api-reference/claude-connector.md) is a separate endpoint for Claude.ai: workflow tools only, and publishing there requires the user to confirm in OpusClip.) Any OpusClip account can complete the OAuth flow and view the tool catalog. Calling a tool requires **Pro Beta**, **Max**, or **Business** plan access; without it, the host returns an upgrade prompt.

#### Install from a directory (one-click)

OpusClip is listed across the agent-discovery ecosystem — the fastest ways to add it (all connect to `https://mcp.opus.pro/mcp`; complete the OAuth sign-in on first use):

* **npm** — `npx @opusclip/mcp`, or add it to your host config:

```json theme={"dark"}
{ "mcpServers": { "opusclip": { "command": "npx", "args": ["-y", "@opusclip/mcp"] } } }
```

* **MCP Registry** — search `opusclip` (server name `io.github.opus-pro/opusclip`).
* **Smithery** — [smithery.ai/servers/opusclip/opusclip](https://smithery.ai/servers/opusclip/opusclip).
* **Cursor** — search `OpusClip` on [cursor.directory](https://cursor.directory), or use an **Add to Cursor** deep link.
* **Cline** — search `OpusClip` in the Cline MCP Marketplace.

#### Other MCP hosts (manual config)

Point your host at `https://mcp.opus.pro/mcp` and complete the OAuth flow when prompted. For example, Cursor (`~/.cursor/mcp.json`) or Cline (`cline_mcp_settings.json`):

```json theme={"dark"}
{ "mcpServers": { "opusclip": { "url": "https://mcp.opus.pro/mcp" } } }
```

#### Tool catalog

The MCP Server exposes the 37 tools below: 29 workflow tools, plus 8 media tools that only mcp.opus.pro serves.

The [Claude Connector](https://help.opus.pro/api-reference/claude-connector.md) is **not** the same surface. It exposes the same 29 workflow tools and none of the media tools, and — the difference that matters most — its posting, scheduling, unscheduling, and project-sharing tools **do not commit**: they return a link the user confirms in OpusClip. On this endpoint those same four tools commit directly, because you configured `mcp.opus.pro` yourself rather than reaching it through a listed connector. Do not assume a prompt that works here behaves identically there.

> [accordion] Read tools (15) — no approval prompt
>
> * `opusclip_whoami` — identity check for the connected org
> * `opusclip_get_usage` — show the org's current API usage against its cap
> * `opusclip_list_projects` — list recent clip projects
> * `opusclip_list_clips` — list clips inside a project
> * `opusclip_describe_clip` — fetch a single clip's detail (transcript, layout, render status)
> * `opusclip_list_collections` — list collections
> * `opusclip_list_clips_in_collection` — list clips inside a collection
> * `opusclip_list_brand_templates` — list brand templates
> * `opusclip_list_social_accounts` — list connected social accounts
> * `opusclip_list_scheduled_posts` — list scheduled and recent posts (returns the `schedule_id` that unscheduling requires)
> * `opusclip_get_transcript` — fetch a project's source-video transcript
> * `opusclip_get_social_copy_job` — fetch a social copy job
> * `opusclip_analyze_video` — report what is on screen across a time range of the **source video**: faces and people with their positions, screen regions, document layout, and whether the person on camera is the one speaking · asynchronous — one call with `projectId`, `clipId`, `startMs` and `endMs` starts it and returns a `task_id`, then call again with `taskId` alone until `status` is `completed` and `segments` appear · offsets are measured from the start of the source video, not the clip · changes nothing and spends no credits
> * `opusclip_list_pinterest_boards` — list the boards a connected Pinterest account can pin to. Pinterest requires a board on every pin, so pass the board ID as `boardId` to `create_post_task` or `schedule_publish`.
> * `opusclip_preview_clips` — show a project's top clips as a playable card grid in chat (6 by default; set `limit`, or `clipId` for a single clip). Hosts that do not support MCP Apps get the same clip data as JSON.

> [accordion] Write tools (14) — approval prompt per call
>
> * `opusclip_submit_project` — clip a YouTube or Vimeo URL · consumes credits
> * `opusclip_create_upload_link` — get a signed URL to upload a local video
> * `opusclip_edit_clip` — edit a clip with named operations in one call: captions, emoji, and keyword-highlight toggles; filler-word and pause removal; section trim, split, drop, and reorder; phrase cutting; caption colour, position, and casing; clip dubbing; and undo · re-renders the preview
> * `opusclip_create_censor_job` — bleep or mask flagged content · consumes credits
> * `opusclip_share_project` — make a project publicly viewable
> * `opusclip_create_collection` — create a collection
> * `opusclip_add_clip_to_collection` — add a clip to a collection
> * `opusclip_export_clip` — get one clip's HD download URL (ready / rendering / unavailable)
> * `opusclip_export_collection` — get HD download URLs for every clip in a collection
> * `opusclip_duplicate_clip` — copy a clip to `<title> (Copy)`; free, no re-render
> * `opusclip_create_social_copy_job` — generate platform-specific social copy
> * `opusclip_create_post_task` — post a clip to a connected social account · Pinterest needs a `boardId`
> * `opusclip_schedule_publish` — schedule a clip for future posting · Pinterest needs a `boardId`
> * `opusclip_unschedule_publish` — cancel a previously scheduled post

> [accordion] Media tools (8) — mcp.opus.pro only
>
> * `opusclip_create_thumbnail_job` — generate thumbnail options for a clip · consumes credits
> * `opusclip_get_thumbnail_job` — fetch a thumbnail job's status and results
> * `opusclip_create_speech_job` — generate a voiceover from text, with 30 prebuilt voices and optional style direction (up to 6,000 characters; each CJK character counts as 3) · consumes credits
> * `opusclip_create_music_job` — generate a music track from a prompt: genre, instruments, BPM, structure, and mood, plus lyrics or "instrumental only" · consumes credits
> * `opusclip_create_video_job` — generate an MP4 clip from a prompt or a first frame. Hailuo 3: 5–15 seconds, 768p or 2K, can start and end on a given frame. Seedance 2.5: 4–30 seconds, 480p or 720p, optional native audio · consumes credits
> * `opusclip_get_media_generation_job` — fetch a speech, music, or video job's status, credits charged, and download URLs (valid for 24 hours)
> * `opusclip_analyze_reference_media` — analyze a reference video or audio file (up to 300 seconds) against your prompt · holds 15 credits while it runs, then charges the actual cost
> * `opusclip_get_reference_analysis` — fetch an analysis result and the credits charged
>
> Speech, music, and video generation have a fixed price. Before it spends anything, the agent gets a free quote (`maxCredits: 0`) and shows you the price. Each call sets the most credits it may spend, so it never charges more than you approved. Credits are held when the job starts, charged when it succeeds, and released if it fails.

Retired tools: `opusclip_get_editing_script`, `opusclip_apply_editing_script`, and `opusclip_create_media_generation_job` are no longer listed. An agent that calls one from an outdated tool list is pointed to its replacement.

`list_clips` and `describe_clip` return **preview** URLs only — the HD download URL comes from `export_clip` (one clip) or `export_collection` (a collection).

#### Troubleshooting

> [accordion] OAuth fails or returns 'No matching client'
>
> Sign in with the same identity provider used to create the OpusClip account (email, Google, or Apple).

> [accordion] Tools return 'API access not enabled for this org'
>
> The org does not have the API entitlement. Pro Beta and Max orgs receive it automatically. Otherwise, [contact sales](https://www.opus.pro/contact-api).

> [accordion] Which org does the connector use for a multi-org user?
>
> The one picked on the OAuth consent screen at connect time. It is fixed for the life of the connection, and no tool can switch it — there is no `list_orgs`. To act in a different org, disconnect and reconnect, choosing that org while signing in. `whoami` reports the current one.

> [accordion] 401 errors keep firing
>
> Hosts refresh tokens automatically. If refresh fails persistently, remove the connector and re-add it.

> [accordion] 403 or 429 responses
>
> `403` indicates the monthly cap (`15h` / `900` credits per workspace) has been hit. The cap resets on the first day of the next month (UTC). `429` indicates the concurrent-project limit (`4`) has been hit and clears as in-flight projects finish. See [Limitations](https://help.opus.pro/api-reference/limitation.md).

Tools consume credits and inherit the Pro Beta & Max caps (`15h` monthly, `10`-credit per-project floor, `4` concurrent projects). See [Limitations](https://help.opus.pro/api-reference/limitation.md).

**2. Try it**

**Clip a video**

> Clip this YouTube video and give me the top 5 best clips
> `https://youtube.com/watch?v=...`

**Inline edits**

> Fix the typo in caption 4 of clip 3.

## What's next

* Using Claude.ai? See the [Claude Connector](https://help.opus.pro/api-reference/claude-connector.md).
* Prefer an API-key code package? See the [Skill](https://help.opus.pro/api-reference/skill.md).
* Wondering what changed? See the [release notes](https://github.com/opus-pro/opusclip-mcp/releases).
* Need higher limits? [Contact sales](https://www.opus.pro/contact-api).
* On a **Business** plan? Your custom limits live in your contract. Talk to your account manager for details.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.