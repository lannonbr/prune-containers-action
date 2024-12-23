const dayjs = require("dayjs");
const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  const today = dayjs();

  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

  const package_name = core.getInput("container-name", { required: true });

  const versions =
    await octokit.rest.packages.getAllPackageVersionsForPackageOwnedByAuthenticatedUser(
      {
        package_type: "container",
        package_name,
      }
    );

  let versionsRemoved = 0;

  for (const version of versions.data) {
    // delete untagged versions that are older than 7 days
    if (
      today.diff(dayjs(version.created_at), "days") > 7 &&
      version.metadata.container.tags.length === 0
    ) {
      await octokit.rest.packages.deletePackageVersionForAuthenticatedUser({
        package_type: "container",
        package_name: package_name,
        package_version_id: version.id,
      });
      versionsRemoved++;
    }
  }

  console.log(`Image versions pruned: ${versionsRemoved}`);
}

run();
