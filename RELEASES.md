# New Releases

Creating release is partially a manual process right now.

Backed by the npm package `release-it` the process is as follows:

1. Create branch with the following name pattern: 'release/r0.0.0'
1. Update version in package.json
1. Make sure that your branch is pushed (local branch is not enough).
1. Make sure you have a version you want to release.
1. Make sure you have permissions to this github repository as well as the npm registry.
1. Execute `npm run release`.
1. Choose a release type.
1. Select yes to all the questions.
1. Once github opens, generate release notes with the github web UI and modify the output.
1. Create the release as a draft.
1. Have your team review it.
1. Publish it.

* It looks like this flow works if you have NodeJS version > 24.0. If you face strange issue, as variant try to update NodeJS