require 'watir'


module SlowWatir
  def SlowWatir.await(times=20, seconds=0.5)
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

  def SlowWatir.attach(how, what)
    SlowWatir.await { Watir::Browser.attach(how, what) }
  end

  class Proxy
    # undefine just about everything
    instance_methods.each do |m|
      undef_method m unless m =~ /(^__|^send$|^object_id$)/
    end

    def initialize(target)
      @target = target
    end
  end

  class MaybeProxy < Proxy
    def method_missing(name, *args, &block)
      begin
        result = @target.send(name, *args, &block)
        if not result or (result.respond_to? :exists? and not result.exists?)
          raise Exception.new
        end
        result
      rescue Exception => e
        # this allows all messages on this object to silently do nothing
        self
      end
    end
  end

  class WaitProxy < Proxy
    def method_missing(name, *args, &block)
      SlowWatir.await { @target.send(name, *args, &block) }
    end
  end

  module Browser
    def maybe
      @slow_maybe__ ||= SlowWatir::MaybeProxy.new(self)
    end

    def await
      @slow_wait__ ||= SlowWatir::WaitProxy.new(self)
    end
  end
end

# monkey patch if available
begin
  module FireWatir
    class Firefox
      include SlowWatir::Browser
    end
  end
rescue Exception => e
end

begin
  module Watir
    class IE
      include SlowWatir::Browser
    end
  end
rescue Exception => e
end
