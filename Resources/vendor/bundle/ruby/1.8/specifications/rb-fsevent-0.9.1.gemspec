# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{rb-fsevent}
  s.version = "0.9.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Thibaud Guillaume-Gentil", "Travis Tilley"]
  s.date = %q{2012-04-09}
  s.description = %q{FSEvents API with Signals catching (without RubyCocoa)}
  s.email = ["thibaud@thibaud.me", "ttilley@gmail.com"]
  s.files = ["bin/fsevent_watch", "lib/rb-fsevent/fsevent.rb", "lib/rb-fsevent/version.rb", "lib/rb-fsevent.rb", "ext/fsevent_watch/Info.plist", "ext/fsevent_watch/LICENSE", "ext/fsevent_watch/fsevent_watch/TSICTString.c", "ext/fsevent_watch/fsevent_watch/TSICTString.h", "ext/fsevent_watch/fsevent_watch/cli.c", "ext/fsevent_watch/fsevent_watch/cli.h", "ext/fsevent_watch/fsevent_watch/common.h", "ext/fsevent_watch/fsevent_watch/compat.c", "ext/fsevent_watch/fsevent_watch/compat.h", "ext/fsevent_watch/fsevent_watch/main.c", "ext/fsevent_watch/fsevent_watch.xcodeproj/project.pbxproj", "ext/fsevent_watch/xcconfig/Common.xcconfig", "ext/fsevent_watch/xcconfig/Debug.xcconfig", "ext/fsevent_watch/xcconfig/Release.xcconfig", "ext/fsevent_watch/xcconfig/fsevent_watch.xcconfig", "ext/rakefile.rb", "ext/rb-fsevent.xcconfig", "LICENSE", "README.rdoc"]
  s.homepage = %q{http://rubygems.org/gems/rb-fsevent}
  s.require_paths = ["lib"]
  s.rubyforge_project = %q{rb-fsevent}
  s.rubygems_version = %q{1.3.7}
  s.summary = %q{Very simple & usable FSEvents API}

  if s.respond_to? :specification_version then
    current_version = Gem::Specification::CURRENT_SPECIFICATION_VERSION
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_development_dependency(%q<bundler>, ["~> 1.0"])
      s.add_development_dependency(%q<rspec>, ["~> 2.5.0"])
      s.add_development_dependency(%q<guard-rspec>, ["~> 0.1.9"])
    else
      s.add_dependency(%q<bundler>, ["~> 1.0"])
      s.add_dependency(%q<rspec>, ["~> 2.5.0"])
      s.add_dependency(%q<guard-rspec>, ["~> 0.1.9"])
    end
  else
    s.add_dependency(%q<bundler>, ["~> 1.0"])
    s.add_dependency(%q<rspec>, ["~> 2.5.0"])
    s.add_dependency(%q<guard-rspec>, ["~> 0.1.9"])
  end
end
