#!/usr/bin/ruby
#There is room for improvement in this script. critique welcomed.
require 'socket'
require 'rubygems'

require 'json'
require 'fssm'

path = '/Users/mitch/Sites/klocko'

# used to check asssets against ignore list.
def ignore? key
   ['.git', '.svn'].each { |e|
    if(key.include?(e) == true)
      return true;
    end
  }
  return false
end

FSSM.monitor path do |m|
    m.update do |base, relative|
      
      puts 'Update event'
      
      unless ignore? relative
        puts relative
      end

    end

    m.create do |base, relative|
      unless ignore? relative
        puts relative
      end
    end

    # if !options['keep_files']
    #   m.delete do |base, relative|
    #     delete_asset(relative, options['quiet'])          
    #   end
    # end
end