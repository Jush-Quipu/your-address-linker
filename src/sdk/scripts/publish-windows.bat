
@echo off
REM Windows script to publish the SecureAddress Bridge SDK

REM Set the npm token
set NPM_TOKEN=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

REM Configure npm to use the token for authentication
echo //registry.npmjs.org/:_authToken=%NPM_TOKEN% > %USERPROFILE%\.npmrc

REM Run the release script with the specified release type
REM Default to patch if no release type is specified
set RELEASE_TYPE=%1
if "%RELEASE_TYPE%"=="" set RELEASE_TYPE=patch

echo 🚀 Running release script with %RELEASE_TYPE% version update...
node "%~dp0\release.js" %RELEASE_TYPE%

echo ✅ Publication process complete!
