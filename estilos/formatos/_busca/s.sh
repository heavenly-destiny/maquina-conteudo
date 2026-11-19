#!/bin/zsh
cat=${1%%|*}; q=${1#*|}
enc=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote_plus(sys.argv[1]))" "$q")
yt-dlp --no-update "https://www.youtube.com/results?search_query=$enc&sp=CAMSAhgB" --flat-playlist --playlist-end 40 --print "$cat	%(id)s	%(view_count)s	%(duration)s	%(channel)s	%(title)s	$q" 2>/dev/null > "r6/${q// /_}.tsv"
