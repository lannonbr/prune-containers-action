import * as core from "@actions/core";
import * as github from "@actions/github";
import dayjs from "dayjs";

async function run() {
  const today = dayjs();

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required.");
  }

  const octokit = github.getOctokit(token);

  const packageName = core.getInput("container-name", { required: true });

  const versions = await octokit.paginate(
    octokit.rest.packages.getAllPackageVersionsForPackageOwnedByAuthenticatedUser,
    {
      package_type: "container",
      package_name: packageName,
      per_page: 100,
    }
  );

  let versionsRemoved = 0;

  for (const version of versions) {
    // delete untagged versions that are older than 7 days
    if (
      today.diff(dayjs(version.created_at), "days") > 7 &&
      version.metadata?.container?.tags?.length === 0
    ) {
      await octokit.rest.packages.deletePackageVersionForAuthenticatedUser({
        package_type: "container",
        package_name: packageName,
        package_version_id: version.id,
      });
      versionsRemoved++;
    }
  }

  core.info(`Image versions pruned: ${versionsRemoved}`);
}

run().catch((error) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});
