if [ -z "$LAUNCH_LINK" ]; then
    echo LAUNCH_LINK environment variable is not set
    exit 1
fi

echo "Launching View using link '$LAUNCH_LINK'"
adb shell am start -a android.intent.action.VIEW -d "$LAUNCH_LINK"