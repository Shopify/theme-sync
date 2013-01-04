#!/usr/bin/ruby

require 'socket'
require 'rubygems'
require 'json'
gem 'listen', '= 0.5.2'  
require 'listen'
path = '/Users/mitch/Sites/klocko'

Listen.to(path, :force_polling => false, :ignore => %r[.hg]) do |modified, added, removed|
  puts 'Modified:'
  puts modified.inspect
end