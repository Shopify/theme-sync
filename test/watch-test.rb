#!/usr/bin/ruby
#opened bug https://github.com/guard/listen/issues/61
#
#There is room for improvement in this script. critique welcomed.
require 'socket'
require 'rubygems'
require 'json'
# Listen needs gem install --version '~> 0.9.1' rb-fsevent
require 'listen'

path = '/Users/mitch/Sites/klocko-and-sons3230-1984692'

callback = Proc.new do |modified, added, removed|
  puts 'Modified:'
  puts modified.inspect
  # puts 'Added:'
  # puts added.inspect
end


listener = Listen.to(path)
listener.change(&callback) # convert the callback to a block and register it
listener.latency(1)
listener.start # blocks execution

# FSSM.monitor path do |m|
#     m.update do |base, relative|
#       
#       puts 'Update event'
#       
#       unless ignore? relative
#         puts relative
#       end
# 
#     end
# 
#     m.create do |base, relative|
#       unless ignore? relative
#         puts relative
#       end
#     end
# 
#     # if !options['keep_files']
#     #   m.delete do |base, relative|
#     #     delete_asset(relative, options['quiet'])          
#     #   end
#     # end
# end