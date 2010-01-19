/**
 * author naitik
 * @provides fb.iframe-widget-css
 * @layer xfbml
 * @requires fb.dom
 * @option preserve-image-urls
 */

FB.Dom.addCssRules(
'.FB_HideIframes iframe {\
  visibility: hidden;\
}\
.FB_IframeLoader {\
  position: relative;\
  display: inline-block;\
}\
.FB_IframeLoader iframe {\
  min-height: 200px;\
  z-index: 2;\
}\
.FB_IframeLoader .FB_Loader {\
  background: url(http://static.ak.fbcdn.net/images/loaders/indicator_blue_large.gif) no-repeat;\
  height: 32px;\
  width: 32px;\
  margin-left: -16px;\
  position: absolute;\
  left: 50%;\
  z-index: 4;\
}\
', 'FB.iframe-widget-css');
