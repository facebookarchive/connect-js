/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.intl.en_US
 * @requires fb.prelude
 */

/**
 * Provides the en_US version of the required strings for use by those choosing
 * to host the library themselves rather than use the one we serve.
 *
 * TODO (naitik) This is a temporary solution. In the long run, we should
 * provide the ability to generate this file for any locale using the API.
 *
 * Note: This file is not included in the version of the library served by
 * facebook.
 *
 * @class FB.Intl
 * @static
 * @access public
 */
FB.provide('FB.Intl', {
  _stringTable: {
    'sh:loading': 'Loading...',
    'sh:share-button': 'Share',
    'cs:share-on-facebook': 'Share on Facebook',
    'cs:connect': 'Connect',
    'cs:connect-with-facebook': 'Connect with Facebook',
    'cs:logout': 'Facebook Logout',
    'cs:bookmark-on-facebook': 'Bookmark on Facebook',
    'cs:add-profile-tab-on-facebook': 'Add Profile Tab on Facebook'
  }
});
