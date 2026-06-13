// plugins/withAndroidLintFix.js
//
// The app.json `locales` field provides localized iOS permission strings (NS*).
// Current Expo SDKs also emit these into Android localized resources
// (values-b+de, values-b+en). Android's release lint then fails with
// `ExtraTranslation` because those keys have no value in the default locale.
// The strings are harmless on Android, so we disable that single lint check
// (and keep the build from aborting on lint) via android/app/build.gradle.

const { withAppBuildGradle } = require('@expo/config-plugins');

const LINT_BLOCK = [
  '    lint {',
  "        disable 'ExtraTranslation'",
  '        checkReleaseBuilds false',
  '    }',
].join('\n');

const withAndroidLintFix = (config) =>
  withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;
    // Idempotent: skip if already injected.
    if (contents.includes("disable 'ExtraTranslation'")) {
      return cfg;
    }
    // Insert the lint {} block immediately inside the main `android {` block.
    contents = contents.replace(/android\s*\{/, (match) => `${match}\n${LINT_BLOCK}`);
    cfg.modResults.contents = contents;
    return cfg;
  });

module.exports = withAndroidLintFix;
