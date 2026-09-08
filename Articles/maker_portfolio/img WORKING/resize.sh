#!/bin/bash
find ./ -type f -iname "*.jpeg" -exec mogrify -verbose -format jpeg -layers Dispose -resize 1024\>x1024\> -quality 85% {} +
find ./ -type f -iname "*.jpg" -exec mogrify -verbose -format jpg -layers Dispose -resize 1024\>x1024\> -quality 85% {} +
find ./ -type f -iname "*.png" -exec mogrify -verbose -format png -alpha on -layers Dispose -resize 1024\>x1024\> {} +

