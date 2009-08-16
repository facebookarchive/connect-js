require 'test/unit'
require 'watir'

FB_EMAIL = ENV['fb_email']
FB_PASS = ENV['fb_pass']

def wait(times=20, seconds=0.5, &block)
  begin
    result = yield
    if not result or (result.respond_to? :exists? and not result.exists?)
      raise Exception.new
    end
  rescue Exception => e
    if (times -= 1) > 0
      sleep(seconds)
      retry
    end
  end
  yield
end

def will_throw(&block)
  begin
    yield
  rescue
  end
end

def fb_login(browser)
  wait { browser.text_field(:id, 'email') }.set(FB_EMAIL)
  wait { browser.text_field(:id, 'pass') }.set(FB_PASS)
end

class Delegator < Test::Unit::TestCase

  def test_qunit
    browser = Watir::Browser.new

    # go to facebook and make sure we're logged out
    browser.goto('http://www.facebook.com/home.php')
    begin
      browser.link(:text, 'Logout').click
    rescue
      # ignore if no Logout link found
    end

    # make sure the username/password works
    browser.goto('http://www.facebook.com/login.php')
    fb_login(browser)
    wait { browser.button(:value, 'Login') }.click

    # logout
    wait { browser.link(:text, 'Logout') }.click

    # start the tests
    browser.goto('http://daaku.org:8080/tests/index.html')

    # share without calling Mu.init
    wait { browser.button(:class, 'share-without-init') }.click
    browser = wait { Watir::Browser.attach(:url, /sharer.php/) }
    fb_login(browser)
    wait { browser.button(:value, 'Login') }.click
    will_throw {
      wait { browser.button(:value, 'Cancel') }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    # clear status if exists
    wait { browser.button(:class, 'clear-session-if-exists') }.click

    # get the status
    wait { browser.button(:class, 'get-status') }.click

    # cancel login using cancel button
    wait { browser.button(:class, 'login-cancel-button') }.click
    browser = wait { Watir::Browser.attach(:url, /tos.php/) }
    will_throw {
      wait { browser.button(:value, 'Cancel') }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    # cancel login using os chrome
    wait { browser.button(:class, 'login-close-window') }.click
    browser = wait { Watir::Browser.attach(:url, /tos.php/) }
    browser.close
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    # login using connect button
    wait { browser.button(:class, 'login-with-connect-button') }.click
    browser = wait { Watir::Browser.attach(:url, /tos.php/) }
    will_throw {
      wait { browser.button(:value, 'Connect') }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    # login with email/pass
    wait { browser.button(:class, 'login-with-email-pass') }.click
    browser = wait { Watir::Browser.attach(:url, /login.php/) }
    fb_login(browser)
    will_throw {
      wait { browser.button(:value, 'Connect') }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    # dont allow for offline_access extended perms
    wait { browser.button(:class, 'dont-allow-perms') }.click
    browser = wait { Watir::Browser.attach(:url, /prompt_permissions.php/) }
    will_throw {
      wait { browser.button(:value, "Don't Allow") }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    # allow for offline_access extended perms
    wait { browser.button(:class, 'allow-perms') }.click
    browser = wait { Watir::Browser.attach(:url, /prompt_permissions.php/) }
    will_throw {
      wait { browser.button(:value, "Allow") }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    # connect and dont allow for offline_access extended permission
    wait { browser.button(:class, 'connect-and-dont-allow') }.click
    browser = wait { Watir::Browser.attach(:url, /tos.php/) }
    wait { browser.button(:value, 'Connect') }.click
    will_throw {
      wait { browser.button(:value, "Don't Allow") }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    # connect and allow for offline_access extended permission
    wait { browser.button(:class, 'connect-and-allow') }.click
    browser = wait { Watir::Browser.attach(:url, /tos.php/) }
    wait { browser.button(:value, 'Connect') }.click
    will_throw {
      wait { browser.button(:value, "Allow") }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    # cancel add friend
    wait { browser.button(:class, 'cancel-add-friend') }.click
    browser = wait { Watir::Browser.attach(:url, /addfriend.php/) }
    browser.close
    browser = Watir::Browser.attach(:title, 'Mu Tests')

#    # publish story
#    wait { browser.button(:class, 'publish-story') }.click
#    browser = wait { Watir::Browser.attach(:url, /prompt_feed.php/) }
#    wait { browser.button(:value, 'Publish') }.click
#    browser = Watir::Browser.attach(:title, 'Mu Tests')


    wait { browser.h2(:class, 'pass') }
  end

end
