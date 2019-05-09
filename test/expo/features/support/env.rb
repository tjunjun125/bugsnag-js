bs_username = ENV['BROWSER_STACK_USERNAME']
bs_access_key = ENV['BROWSER_STACK_ACCESS_KEY']
bs_local_id = ENV['BROWSER_STACK_LOCAL_IDENTIFIER'] || 'maze_expo_id'
bs_device = ENV['DEVICE_TYPE']
app_location = ENV['APP_LOCATION']

FAILED_SCENARIO_OUTPUT_PATH = File.join(Dir.pwd, 'maze_output')

def write_failed_requests_to_disk(scenario)
  Dir.mkdir(FAILED_SCENARIO_OUTPUT_PATH) unless Dir.exists? FAILED_SCENARIO_OUTPUT_PATH
  Dir.chdir(FAILED_SCENARIO_OUTPUT_PATH) do
    date = DateTime.now.strftime('%d%m%y%H%M%S%L')
    Server.stored_requests.each_with_index do |request, i|
      filename = "#{scenario.name}-request#{i}-#{date}.log"
      File.open(filename, 'w+') do |file|
        file.puts "URI: #{request[:request].request_uri}"
        file.puts "HEADERS:"
        request[:request].header.each do |key, values|
          file.puts "  #{key}: #{values.map {|v| "'#{v}'"}.join(' ')}"
        end
        file.puts
        file.puts "BODY:"
        file.puts JSON.pretty_generate(request[:body])
      end
    end
  end
end

After do |scenario|
  write_failed_requests_to_disk(scenario) if scenario.failed?
end

Before('@skip_android_5') do |scenario|
  skip_this_scenario("Skipping scenario") if $driver.device_type == 'ANDROID_5'
end

Before('@skip_android_7') do |scenario|
  skip_this_scenario("Skipping scenario") if $driver.device_type == 'ANDROID_7'
end

Before('@skip_android_8') do |scenario|
  skip_this_scenario("Skipping scenario") if $driver.device_type == 'ANDROID_8'
end

After do |_scenario|
  $driver.reset_app unless $driver.nil?
end

AfterConfiguration do |config|
  $driver = AppAutomateDriver.new(bs_username, bs_access_key, bs_local_id)
  $driver.start_driver(bs_device, app_location)
end