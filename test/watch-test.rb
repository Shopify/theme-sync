#!/usr/bin/ruby

require 'socket'
require 'rubygems'

# To use bundled gems
root = File.dirname(__FILE__)
gem_path = File.join(root, '../', 'Resources', 'vendor', 'bundle','ruby','1.8')
Gem.use_paths(gem_path)


require 'json/pure'

require 'rb-fsevent'

gem 'listen', '= 0.5.3'
require 'listen'

puts [ JSON.parser, JSON.generator ]

# path = '/Users/mitch/Sites/klocko'

# Listen.to(path, :force_polling => false, :ignore => %r[.hg|.sass|.less]) do |modified, added, removed|
#   puts 'Modified:'
#   puts modified.inspect
# end