#!/bin/sh

FILES=(
  src/core/prelude.js
  src/core/api.js
  src/core/auth.js
  src/core/content.js
  src/core/cookie.js
  src/core/init.js
  src/core/event.js
  src/core/flash.js
  src/core/frames.js
  src/core/md5sum.js
  src/core/qs.js
  src/core/ui.js
  src/core/xd.js
)

curl http://json.org/json2.js
cat ${FILES[@]}
