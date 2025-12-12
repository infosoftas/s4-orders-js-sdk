# New Releases

Creating release is partially a manual process right now.

Backed by the npm package `release-it` the process is as follows:

- Create branch with the following name pattern: 'release/r0.0.0'
- Update version in package.json
- Make sure that your branch is pushed (local branch is not enough).
- Make sure you have a version you want to release.
- Make sure you have permissions to this github repository as well as the npm registry.
- Execute `npm run release`.
- Choose a release type.
- Select yes to all the questions.
- Once github opens, generate release notes with the github web UI and modify the output.
- Create the release as a draft.
- Have your team review it.
- Publish it.

* It looks like this flow works if you have NodeJS version > 24.0. If you face strange issue, as variant try to update NodeJS