require 'test/unit'
require 'watir'

FB_EMAIL = 'FIXME'
FB_PASS = 'FIXME'

def wait(&cond)
  Watir::Waiter.wait_until {
    begin
      cond.call()
    rescue
    end
  }
  cond.call()
end

def will_throw(&cond)
  begin
    cond.call()
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
    browser.goto('http://connect.daaku.org/mu/tests/index.html')

    puts "share without calling Mu.init"
    wait { browser.button(:class, 'share-without-init') }.click
    wait { browser.attach(:url, /sharer.php/) }
    fb_login(browser)
    wait { browser.button(:id, 'login') }.click
    will_throw {
      wait { browser.button(:id, 'cancel') }.click
    }
    browser.attach(:title, 'Mu Tests')

    puts "clear status if exists"
    wait { browser.button(:class, 'clear-session-if-exists') }.click
    sleep 4

    puts "get the status"
    wait { browser.button(:class, 'get-status') }.click
    sleep 4

    puts "cancel login using cancel button"
    wait { browser.button(:class, 'login-cancel-button') }.click
    wait { browser.attach(:url, /tos.php/) }
    will_throw {
      wait { browser.button(:id, 'cancel') }.click
    }
    browser.attach(:title, 'Mu Tests')

    puts "cancel login using os chrome"
    wait { browser.button(:class, 'login-close-window') }.click
    wait { browser.attach(:url, /tos.php/) }
    browser.close
    sleep 0.5
    browser.attach(:title, 'Mu Tests')

    puts "login using connect button"
    wait { browser.button(:class, 'login-with-connect-button') }.click
    wait { browser.attach(:url, /tos.php/) }
    will_throw {
      wait { browser.button(:id, 'confirm_button') }.click
    }
    browser.attach(:title, 'Mu Tests')

    sleep 4

    puts "login with email/pass"
    wait { browser.button(:class, 'login-with-email-pass') }.click
    wait { browser.attach(:url, /login.php/) }
    fb_login(browser)
    will_throw {
      wait { browser.button(:value, 'Connect') }.click
    }
    browser.attach(:title, 'Mu Tests')

    puts "dont allow for offline_access extended perms"
    wait { browser.button(:class, 'dont-allow-perms') }.click
    wait { browser.attach(:url, /prompt_permissions.php/) }
    will_throw {
      wait { browser.button(:value, "Don't Allow") }.click
    }
    browser.attach(:title, 'Mu Tests')

    puts "allow for offline_access extended perms"
    wait { browser.button(:class, 'allow-perms') }.click
    wait { browser.attach(:url, /prompt_permissions.php/) }
    will_throw {
      wait { browser.button(:value, "Allow") }.click
    }
    browser.attach(:title, 'Mu Tests')

    sleep 4

    puts 'connect and dont allow for offline_access extended permission'
    wait { browser.button(:class, 'connect-and-dont-allow') }.click
    wait { browser.attach(:url, /tos.php/) }
    wait {browser.button(:value, 'Connect') }.click
    sleep 4
    will_throw {
      wait { browser.button(:value, "Don't Allow") }.click
    }
    browser.attach(:title, 'Mu Tests')

    sleep 4

    puts 'connect and allow for offline_access extended permission'
    wait { browser.button(:class, 'connect-and-allow') }.click
    wait { browser.attach(:url, /tos.php/) }
    wait { browser.button(:value, 'Connect') }.click
    sleep 4
    will_throw {
      wait { browser.button(:value, "Allow") }.click
    }
    browser.attach(:title, 'Mu Tests')

    sleep 4

    puts 'cancel add friend'
    wait { browser.button(:class, 'cancel-add-friend') }.click
    wait { browser.attach(:url, /addfriend.php/) }
    browser.close
    sleep 0.5
    browser.attach(:title, 'Mu Tests')

    sleep 4


    assert('pass' == browser.h2(:id, 'banner').attribute_value('className'))

    # finally logout
    browser.goto('http://www.facebook.com/home.php')
    browser.link(:text, 'Logout').click
  end

end
