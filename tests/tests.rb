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

    puts "go to facebook and make sure we're logged out"
    browser.goto('http://www.facebook.com/home.php')
    begin
      browser.link(:text, 'Logout').click
    rescue
      # ignore if no Logout link found
    end

    puts "make sure the username/password works"
    browser.goto('http://www.facebook.com/login.php')
    fb_login(browser)
    wait { browser.button(:value, 'Login') }.click
    wait { browser.link(:text, 'Logout') }

    puts "logout"
    browser.link(:text, 'Logout').click

    puts "start the tests"
    browser.goto('http://daaku.org:8080/tests/index.html')

    puts "share without calling Mu.init"
    wait { browser.button(:class, 'share-without-init') }.click
    browser = wait { Watir::Browser.attach(:url, /sharer.php/) }
    fb_login(browser)
    wait { browser.button(:id, 'login') }.click
    will_throw {
      wait { browser.button(:id, 'cancel') }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    puts "clear status if exists"
    wait { browser.button(:class, 'clear-session-if-exists') }.click

    puts "get the status"
    wait { browser.button(:class, 'get-status') }.click

    puts "cancel login using cancel button"
    wait { browser.button(:class, 'login-cancel-button') }.click
    browser = wait { Watir::Browser.attach(:url, /tos.php/) }
    will_throw {
      wait { browser.button(:id, 'cancel') }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    puts "cancel login using os chrome"
    wait { browser.button(:class, 'login-close-window') }.click
    browser = wait { Watir::Browser.attach(:url, /tos.php/) }
    browser.close
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    puts "login using connect button"
    wait { browser.button(:class, 'login-with-connect-button') }.click
    browser = wait { Watir::Browser.attach(:url, /tos.php/) }
    will_throw {
      wait { browser.button(:id, 'confirm_button') }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    puts "login with email/pass"
    wait { browser.button(:class, 'login-with-email-pass') }.click
    browser = wait { Watir::Browser.attach(:url, /login.php/) }
    fb_login(browser)
    will_throw {
      wait { browser.button(:value, 'Connect') }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    puts "dont allow for offline_access extended perms"
    wait { browser.button(:class, 'dont-allow-perms') }.click
    browser = wait { Watir::Browser.attach(:url, /prompt_permissions.php/) }
    will_throw {
      wait { browser.button(:value, "Don't Allow") }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    puts "allow for offline_access extended perms"
    wait { browser.button(:class, 'allow-perms') }.click
    browser = wait { Watir::Browser.attach(:url, /prompt_permissions.php/) }
    will_throw {
      wait { browser.button(:value, "Allow") }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    puts 'connect and dont allow for offline_access extended permission'
    wait { browser.button(:class, 'connect-and-dont-allow') }.click
    browser = wait { Watir::Browser.attach(:url, /tos.php/) }
    wait { browser.button(:value, 'Connect') }.click
    will_throw {
      wait { browser.button(:value, "Don't Allow") }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    puts 'connect and allow for offline_access extended permission'
    wait { browser.button(:class, 'connect-and-allow') }.click
    browser = wait { Watir::Browser.attach(:url, /tos.php/) }
    wait { browser.button(:value, 'Connect') }.click
    will_throw {
      wait { browser.button(:value, "Allow") }.click
    }
    browser = Watir::Browser.attach(:title, 'Mu Tests')

    puts 'cancel add friend'
    wait { browser.button(:class, 'cancel-add-friend') }.click
    browser = wait { Watir::Browser.attach(:url, /addfriend.php/) }
    browser.close
    browser = Watir::Browser.attach(:title, 'Mu Tests')

#    puts 'publish story'
#    wait { browser.button(:class, 'publish-story') }.click
#    browser = wait { Watir::Browser.attach(:url, /prompt_feed.php/) }
#    wait { browser.button(:value, 'Publish') }.click
#    browser = Watir::Browser.attach(:title, 'Mu Tests')


    wait { browser.h2(:class, 'pass') }
  end

end
