#!/usr/bin/ruby
# @todo ERROR Handling! What happens when things crap out?
require 'socket'
require 'rubygems'

require 'json'
require 'fssm'

path = ARGV.shift
port = ARGV.shift || 0 # default is to use the next available port
host = ARGV.shift # default is to bind everything

server = host ? TCPServer.open(host, port) : TCPServer.open(port)

port = server.addr[1]
addrs = server.addr[2..-1].uniq

# puts "*** listening on #{addrs.collect{|a|"#{a}:#{port}"}.join(' ')}"

s = server.accept

peerport = s.peeraddr[1]
name = s.peeraddr[2]
addr = s.peeraddr[3]

# puts "*** recieving from #{name}:#{peerport}"
# startEvent = { :event => 'connected'}
# s.puts = "connected"

FSSM.monitor path do |m|
    m.update do |base, relative|
      payload = {
        :event => "update",
        :base => base,
        :relative => relative
      }
      s.puts payload.to_json
    end
    m.create do |base, relative|
      payload = {
        :event => "create",
        :base => base,
        :relative => relative
      }
      s.puts payload.to_json
    end
    # if !options['keep_files']
    #   m.delete do |base, relative|
    #     delete_asset(relative, options['quiet'])          
    #   end
    # end
end