#!/usr/bin/ruby
# run as bg process: ./watch_server.rb 40000 > /dev/null &

require 'socket'
require 'rubygems'
# Gem.use_paths("/Users/mitch/.gem/ruby/1.8", "/Library/Ruby/Gems/1.8", "/System/Library/Frameworks/Ruby.framework/Versions/1.8/usr/lib/ruby/gems/1.8")

require 'fssm'

port = ARGV.shift || 0 # default is to use the next available port
host = ARGV.shift # default is to bind everything

server = host ? TCPServer.open(host, port) : TCPServer.open(port)

port = server.addr[1]
addrs = server.addr[2..-1].uniq

puts "*** listening on #{addrs.collect{|a|"#{a}:#{port}"}.join(' ')}"

s = server.accept

port = s.peeraddr[1]
name = s.peeraddr[2]
addr = s.peeraddr[3]

puts "*** recieving from #{name}:#{port}"

# s.puts 'Server Running'

path = '/Users/mitch/Sites/klocko-shopify-theme'

FSSM.monitor path do |m|
    m.update do |base, relative|
      puts "update #{relative}"
      s.puts "update #{relative}"
      # send_asset(relative, options['quiet']) if local_assets_list.include?(relative)
    end
    m.create do |base, relative|
      puts "create #{relative}"
      s.puts "create #{relative}"
      # send_asset(relative, options['quiet']) if local_assets_list.include?(relative)
    end
    # if !options['keep_files']
    #   m.delete do |base, relative|
    #     delete_asset(relative, options['quiet'])          
    #   end
    # end
end
