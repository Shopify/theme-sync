#!/usr/bin/ruby
#There is room for improvement in this script. critique welcomed.
require 'socket'
require 'rubygems'

# To use bundled gem
root = File.dirname(__FILE__)
gem_path = File.join(root, '../', 'vendor', 'bundle','ruby','1.8')
Gem.use_paths(nil, [gem_path])

require 'json'
require 'listen'

base_path = ARGV.shift
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

def broadcast_assets(assets, event_type, base, socket)
  
  assets.each do |relative|
    payload = {
      :event => event_type,
      :base => base,
      :relative => relative
    }
    socket.puts payload.to_json  
  end
  
end

Listen.to(base_path, :relative_paths => true) do |modified, added, removed|

  broadcast_assets(modified, 'update', base_path, s)
  broadcast_assets(added, 'create', base_path, s)

end


# FSSM.monitor path do |m|
#     m.update do |base, relative|
# 
#       unless ignore? relative
#         payload = {
#           :event => "update",
#           :base => base,
#           :relative => relative
#         }
#         s.puts payload.to_json
#       end
# 
#     end
# 
#     m.create do |base, relative|
# 
#       unless ignore? relative
#         payload = {
#           :event => "create",
#           :base => base,
#           :relative => relative
#         }
#         s.puts payload.to_json
#       end
#       
#     end
#     # if !options['keep_files']
#     #   m.delete do |base, relative|
#     #     delete_asset(relative, options['quiet'])          
#     #   end
#     # end
# end