> ## Documentation Index
> Fetch the complete documentation index at: https://help.opus.pro/llms.txt
> Use this file to discover all available pages before exploring further.

# Upload Your Own SRT Along With The Video

If you want more control on captions, you can upload your own SRT subtitle files during the submission process.
This gives you more control over transcript accuracy—especially if you already have working files related to it.

## How to Upload Your Own SRT

1. After dropping your video link or uploading your video, click Upload.SRT to add an SRT file in the clip settings section.

![](https://mintcdn.com/opusclip-c3e48c12/XStAq9UXRcMPMTAr/images/imgs/upload-own-srt-1.png?fit=max\&auto=format\&n=XStAq9UXRcMPMTAr\&q=85\&s=51cf4f04795a7f3efb03f3d46f2c5640)

2. Wait for the upload to complete, it should only take a few seconds.
3. Click "Get clips in 1 click"!
4. Once uploaded, your SRT file will be used for us to generate captions instead of the transcript we normally create.

## Supported SRT Format

Your SRT file must follow the standard SRT format:

```
1
00:00:01,000 --> 00:00:04,000
Welcome to my channel!

2
00:00:04,500 --> 00:00:07,000
Today we're diving into...
```

## Why was my SRT not accepted?

If your SRT was rejected by OpusClip, below are some tips on what to watch out for in your file and your clip settings:

* Incomplete subtitle blocks
  * Each block needs:
    * A number
    * A timestamp line
    * At least one line of subtitle text
* Invalid time format
  * Make sure your timestamps follow the format: HH:MM:SS,MS
  * Example: 00:00:01,000
* Missing start or end time
  * Every block must have a start and end timestamp.
  * Example: ✅ 00:00:04,500 --> 00:00:07,000
* Start time is after end time
  * The subtitles should start before it ends.
  * Example:
    * ❌ 00:00:07,000 --> 00:00:04,500
    * ✅ 00:00:04,500 --> 00:00:07,000
* Out-of-order numbering between subtitles
  * Subtitle blocks must be numbered in sequence:
    * ❌ Example: 1, 2, 4, 3...
    * ✅ Example: 1, 2, 3...
* Number mismatch
  * The system expected a specific block number, but got something else. This can break parsing—check your numbering.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.