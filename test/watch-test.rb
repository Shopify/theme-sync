#!/usr/bin/ruby

require 'socket'
require 'rubygems'

# require '../Resources/vendor/bundle/bundler/setup'
 
root = File.dirname(__FILE__)
gem_path = File.join(root, '../', 'Resources', 'vendor', 'bundle','ruby','1.8')
Gem.use_paths(gem_path)

require 'json'
require 'listen'

base_path = '/Users/mitch/Sites/klocko-and-sons3230-1984692'

def broadcast_assets(assets, base)
  
  assets.each do |relative|
    payload = {
      :event => "update",
      :base => base,
      :relative => relative
    }
    puts payload.to_json  
  end
  
end

Listen.to(base_path, :relative_paths => true) do |modified, added, removed|

  # puts 'Modified:'
  #   modified.each { |item| puts item }
  #   # puts 'Added:'
  #   # puts added.inspect
  
  broadcast_assets(added, base_path)
  broadcast_assets(modified, base_path)
end