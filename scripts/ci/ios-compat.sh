#!/usr/bin/env bash
set -euo pipefail

RN_VERSION="${1:?Usage: ios-compat.sh <react-native-version>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/bootstrap-rn-compat.sh"
bootstrap_rn_compat_app "$RN_VERSION"

echo "Building react-native-shiki-engine on iOS for React Native ${RN_VERSION}"

export RCT_NEW_ARCH_ENABLED=1
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

cd "$RN_SHIKI_COMPAT_APP_DIR"
bundle install
cd "$RN_SHIKI_COMPAT_IOS_DIR"
bundle exec pod install

xcodebuild \
  -workspace "${RN_SHIKI_COMPAT_SCHEME}.xcworkspace" \
  -scheme "$RN_SHIKI_COMPAT_SCHEME" \
  -sdk iphonesimulator \
  -configuration Debug \
  -destination 'generic/platform=iOS Simulator' \
  SKIP_BUNDLING=1 \
  build

echo "Successfully built react-native-shiki-engine on iOS with React Native ${RN_VERSION}"
