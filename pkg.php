#!/usr/bin/env php
<?php
//
// Copyright Facebook Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

$JS_FILES = array(
  'src/third-party/json2.js',

  'src/core/prelude.js',

  'src/core/api.js',
  'src/core/auth.js',
  'src/core/component.js',
  'src/core/content.js',
  'src/core/cookie.js',
  'src/core/dialog.js',
  'src/core/event.js',
  'src/core/flash.js',
  'src/core/init.js',
  'src/core/insights.js',
  'src/core/intl.js',
  'src/core/json.js',
  'src/core/qs.js',
  'src/core/ui.js',
  'src/core/ui_methods.js',
  'src/core/xd.js',

  'src/compat/ui.js',

  'src/common/array.js',
  'src/common/dom.js',
  'src/common/type.js',
  'src/common/obj.js',
  'src/common/string.js',
  'src/common/loader.js',

  'src/data/waitable.js',
  'src/data/query.js',
  'src/data/data.js',

  'src/xfbml/element.js',
  'src/xfbml/xfbml.js',
  'src/xfbml/helper.js',
  'src/xfbml/iframe_widget.js',
  'src/xfbml/button_element.js',
  'src/xfbml/edge_widget.js',

  'src/xfbml/tags/activity.js',
  'src/xfbml/tags/comments.js',
  'src/xfbml/tags/fan.js',
  'src/xfbml/tags/like.js',
  'src/xfbml/tags/live_stream.js',
  'src/xfbml/tags/loginbutton.js',
  'src/xfbml/tags/name.js',
  'src/xfbml/tags/profilepic.js',
  'src/xfbml/tags/recommendations.js',
  'src/xfbml/tags/serverfbml.js',
  'src/xfbml/tags/sharebutton.js',

  'src/strings/en_US.js',
);

$CSS_FILES = array(
  'src/css/dialog.css',
  'src/css/button.css',
  'src/css/share_button.css',
  'src/css/base.css',
  'src/css/iframe_widget.css',
);

foreach ($JS_FILES as $file) {
  echo file_get_contents($file);
}

$css = '';
foreach ($CSS_FILES as $file) {
  $css .= file_get_contents($file);
}
// css URLs are relative to facebook domains
$css = preg_replace('#url\(/#', 'url(http://static.ak.fbcdn.net/', $css);
echo 'FB.Dom.addCssRules(' . json_encode($css) . ', ["pkg"])';
