Automated Semantic Versioning with semantic-release
This project implements an automated versioning and release workflow using semantic-release. This enables us to automate the versioning process and to publish releases based on conventional commit messages.

Commit Message Format
To fully benefit from semantic-release, we follow the Conventional Commits specification. Each commit message should be structured as follows:

arduino
Copy code
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
Where type is one of the following:

feat: A new feature
fix: A bug fix
docs: Documentation only changes
style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
refactor: A code change that neither fixes a bug nor adds a feature
perf: A code change that improves performance
test: Adding missing tests or correcting existing tests
build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
chore: Other changes that don't modify src or test files
revert: Reverts a previous commit

Release Workflow
When commits are merged into the main branch, the semantic-release GitHub Action is triggered. Here's what it does:

Analyze Commits: Determines the type of version bump (major, minor, patch) based on the commit messages since the last release.
Generate Release Notes: Compiles the release notes from the commit messages.
Create Git Tag: Tags the current commit with the new version number.
Create GitHub Release: Generates a new release on GitHub with the compiled release notes.
Publish: If configured, pushes the new version to the configured package registry (e.g., npm).
How to Trigger a Release
To trigger a new release, follow these steps:

Merge your feature, fix, or chore branch into the main branch.
Ensure your commit messages follow the Conventional Commits format.
The semantic-release workflow will run automatically on the main branch.
Once the workflow completes successfully, check the "Releases" section on GitHub for the new release.
Troubleshooting
If a release does not happen as expected, check the semantic-release workflow logs for errors. Common issues include misformatted commit messages or issues with the GitHub Actions configuration.

