#!/bin/sh

FILES=(
  src/prelude.js
  src/api.js
  src/auth.js
  src/content.js
  src/cookie.js
  src/core.js
  src/event.js
  src/flash.js
  src/frames.js
  src/md5sum.js
  src/qs.js
  src/ui.js
  src/xd.js
)

curl http://json.org/json2.js
cat ${FILES[@]}
