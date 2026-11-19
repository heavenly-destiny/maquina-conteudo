#!/bin/zsh
cat=${1%%|*}; u=${1#*|}
yt-dlp --no-update "$u" --flat-playlist --playlist-end 60 --print "$cat	%(id)s	%(view_count)s	%(duration)s	$u	%(title)s" 2>/dev/null > "ch/$(echo $u | md5 | cut -c1-8).tsv"
