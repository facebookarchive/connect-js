# Copyright Facebook Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


require 'test/unit'
require 'slowwatir'

FB_EMAIL = ENV['fb_email']
FB_PASS = ENV['fb_pass']

def fb_login(browser)
  browser.await.text_field(:id, 'email').set(FB_EMAIL)
  browser.await.text_field(:id, 'pass').set(FB_PASS)
end

class Delegator < Test::Unit::TestCase

  def test_qunit
    browser = Watir::Browser.new

    # go to facebook and log out if needed
    browser.goto('http://www.facebook.com/home.php')
    browser.maybe.link(:text, 'Logout').click

    # start the tests
    browser.goto('http://daaku.org:8080/tests/index.html')

    # share without calling Mu.init
    browser.await.button(:class, 'share-without-init').click
    browser = SlowWatir.attach(:url, /sharer.php/)
    fb_login(browser)
    browser.await.button(:value, 'Login').click
    browser.await.button(:value, 'Cancel').click
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # clear status if exists
    browser.await.button(:class, 'clear-session-if-exists').click

    # get the status
    browser.await.button(:class, 'get-status').click

    # cancel login using cancel button
    browser.await.button(:class, 'login-cancel-button').click
    browser = SlowWatir.attach(:url, /tos.php/)
    browser.await.button(:value, 'Cancel').click
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # cancel login using os chrome
    browser.await.button(:class, 'login-close-window').click
    browser = SlowWatir.attach(:url, /tos.php/)
    browser.close
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # login using connect button
    browser.await.button(:class, 'login-with-connect-button').click
    browser = SlowWatir.attach(:url, /tos.php/)
    browser.await.button(:value, 'Connect').click
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # login with email/pass
    browser.await.button(:class, 'login-with-email-pass').click
    browser = SlowWatir.attach(:url, /login.php/)
    fb_login(browser)
    browser.await.button(:value, 'Connect').click
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # dont allow for offline_access extended perms
    browser.await.button(:class, 'dont-allow-perms').click
    browser = SlowWatir.attach(:url, /prompt_permissions.php/)
    browser.await.button(:value, "Don't Allow").click
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # allow for offline_access extended perms
    browser.await.button(:class, 'allow-perms').click
    browser = SlowWatir.attach(:url, /prompt_permissions.php/)
    browser.await.button(:value, "Allow").click
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # connect and dont allow for offline_access extended permission
    browser.await.button(:class, 'connect-and-dont-allow').click
    browser = SlowWatir.attach(:url, /tos.php/)
    browser.await.button(:value, 'Connect').click
    browser.await.button(:value, "Don't Allow").click
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # connect and allow for offline_access extended permission
    browser.await.button(:class, 'connect-and-allow').click
    browser = SlowWatir.attach(:url, /tos.php/)
    browser.await.button(:value, 'Connect').click
    browser.await.button(:value, "Allow").click
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # cancel add friend
    browser.await.button(:class, 'cancel-add-friend').click
    browser = SlowWatir.attach(:url, /addfriend.php/)
    browser.close
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # publish post
    browser.await.button(:class, 'publish-post').click
    browser = SlowWatir.attach(:url, /prompt_feed.php/)
    browser.await.button(:value, 'Publish').click
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # skip publishing post
    browser.await.button(:class, 'skip-publish-post').click
    browser = SlowWatir.attach(:url, /prompt_feed.php/)
    browser.await.button(:value, 'Skip').click
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # close publish post window with no callback
    browser.await.button(:class, 'close-publish-post-no-cb').click
    browser = SlowWatir.attach(:url, /prompt_feed.php/)
    browser.close
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # close publish post window
    browser.await.button(:class, 'close-publish-post').click
    browser = SlowWatir.attach(:url, /prompt_feed.php/)
    browser.close
    browser = SlowWatir.attach(:title, 'Mu Tests')

    # session subscribers
    browser.await.button(:class, 'session-subscribers').click
    browser = SlowWatir.attach(:url, /tos.php/)
    browser.await.button(:value, 'Connect').click
    browser = SlowWatir.attach(:url, /tos.php/)
    browser.await.button(:value, 'Connect').click
    browser = SlowWatir.attach(:url, /prompt_permissions.php/)
    browser.await.button(:value, 'Allow').click
    browser = SlowWatir.attach(:url, /prompt_permissions.php/)
    browser.await.button(:value, "Don't Allow").click
    browser = SlowWatir.attach(:title, 'Mu Tests')

    assert(browser.await.h2(:class, 'pass').exists?)
  end

end
