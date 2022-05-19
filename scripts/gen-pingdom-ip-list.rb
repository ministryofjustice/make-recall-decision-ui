#!/bin/env ruby

require 'net/http'

url      = 'https://my.pingdom.com/probes/ipv4'
response = Net::HTTP.get(URI(url))
index    = 1

response.each_line do |line|
  puts "    pingdom-#{index}: \"#{line.strip}\""
  index += 1
end
