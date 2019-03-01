Given("I have started the Android device") do
  steps %Q{
    When I start Android emulator "#{ENV['EMULATOR']}"
  }
end

When("I launch the app with the link {string}") do |link|
  steps %Q{
    When I set environment variable "LAUNCH_LINK" to "#{link}"
    And I run the script "features/scripts/launch-android-app-with-link.sh"
  }
end