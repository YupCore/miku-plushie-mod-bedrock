import { argv, parallel, series, task, tscTask } from "just-scripts";
import {
  BundleTaskParameters,
  bundleTask,
  cleanTask,
  cleanCollateralTask,
  copyFiles,
  coreLint,
  getGameDeploymentRootPaths,
  setupEnvironment,
  STANDARD_CLEAN_PATHS,
  DEFAULT_CLEAN_DIRECTORIES,
  getOrThrowFromProcess,
  watchTask,
  zipTask,
} from "@minecraft/core-build-tasks";
import fs from "fs";
import path from "path";

setupEnvironment(path.resolve(__dirname, ".env"));

const projectName = getOrThrowFromProcess("PROJECT_NAME");
const behaviorPackSource = `./behavior_packs/${projectName}`;
const mainResourcePackSource = `./resource_packs/${projectName}`;
const scriptsSource = "./dist/scripts";
const stagedResourcePackRoot = "./dist/staged_resource_packs";
const stagedMainResourcePack = `${stagedResourcePackRoot}/${projectName}`;
const packagesRoot = "./dist/packages";
const developmentBehaviorPacksPath = "development_behavior_packs";
const developmentResourcePacksPath = "development_resource_packs";
const mainResourcePackMcpack = `${packagesRoot}/${projectName}_rp.mcpack`;
const behaviorPackMcpack = `${packagesRoot}/${projectName}_bp.mcpack`;
const obsoleteStandaloneResourcePackNames = [`${projectName}_en_us_dub`, `${projectName}_legacy_textures`];

type SubpackDefinition = {
  folderName: string;
  name: string;
  sourcePaths: string[];
  injectedFiles: Array<{ sourcePath: string; targetPath: string }>;
};

const subpackDefinitions: SubpackDefinition[] = [
  {
    folderName: "en_us_dub",
    name: "English Dub",
    sourcePaths: [],
    injectedFiles: [
      {
        sourcePath: `${mainResourcePackSource}/sounds/sound_definitions.json`,
        targetPath: "sounds/sound_definitions.json",
      },
    ],
  },
  {
    folderName: "legacy_textures",
    name: "Legacy Textures",
    sourcePaths: [],
    injectedFiles: [
      {
        sourcePath: `${mainResourcePackSource}/textures/terrain_texture.json`,
        targetPath: "textures/terrain_texture.json",
      },
    ],
  },
  {
    folderName: "en_us_dub_legacy_textures",
    name: "English Dub + Legacy Textures",
    sourcePaths: [
      `${mainResourcePackSource}/subpacks/en_us_dub`,
      `${mainResourcePackSource}/subpacks/legacy_textures`,
    ],
    injectedFiles: [
      {
        sourcePath: `${mainResourcePackSource}/sounds/sound_definitions.json`,
        targetPath: "sounds/sound_definitions.json",
      },
      {
        sourcePath: `${mainResourcePackSource}/textures/terrain_texture.json`,
        targetPath: "textures/terrain_texture.json",
      },
    ],
  },
  {
    folderName: "default",
    name: "Default",
    sourcePaths: [],
    injectedFiles: [],
  },
];

const bundleTaskOptions: BundleTaskParameters = {
  entryPoint: path.join(__dirname, "./scripts/main.ts"),
  external: ["@minecraft/server", "@minecraft/server-ui"],
  outfile: path.resolve(__dirname, "./dist/scripts/main.js"),
  minifyWhitespace: false,
  sourcemap: true,
  outputSourcemapPath: path.resolve(__dirname, "./dist/debug"),
};

function projectPath(projectRelativePath: string): string {
  return path.resolve(__dirname, projectRelativePath);
}

function copyDirectoryContents(sourcePath: string, destinationPath: string): void {
  fs.rmSync(destinationPath, { recursive: true, force: true });
  fs.mkdirSync(destinationPath, { recursive: true });
  fs.cpSync(sourcePath, destinationPath, { recursive: true });
}

function copyDirectoryContentsInto(sourcePath: string, destinationPath: string): void {
  fs.mkdirSync(destinationPath, { recursive: true });
  fs.cpSync(sourcePath, destinationPath, { recursive: true });
}

function copyInjectedFile(sourcePath: string, destinationRoot: string, targetPath: string): void {
  const destinationPath = path.join(destinationRoot, targetPath);
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
}

function readJsonFile(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJsonFile(filePath: string, value: unknown): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function updateStagedResourcePackManifest(): void {
  const manifestPath = projectPath(`${stagedMainResourcePack}/manifest.json`);
  const manifest = readJsonFile(manifestPath);
  manifest.subpacks = subpackDefinitions.map((subpack) => ({
    folder_name: subpack.folderName,
    name: subpack.name,
    memory_tier: 1,
  }));
  manifest.settings = [
    {
      type: "label",
      text: "Choose Default, English Dub, Legacy Textures, or English Dub + Legacy Textures.",
    },
  ];
  writeJsonFile(manifestPath, manifest);
}

function stageMainResourcePack(): void {
  copyDirectoryContents(projectPath(mainResourcePackSource), projectPath(stagedMainResourcePack));
  updateStagedResourcePackManifest();

  for (const subpack of subpackDefinitions) {
    const stagedSubpackPath = projectPath(`${stagedMainResourcePack}/subpacks/${subpack.folderName}`);
    fs.mkdirSync(stagedSubpackPath, { recursive: true });

    for (const sourcePath of subpack.sourcePaths) {
      copyDirectoryContentsInto(projectPath(sourcePath), stagedSubpackPath);
    }

    for (const injectedFile of subpack.injectedFiles) {
      copyInjectedFile(projectPath(injectedFile.sourcePath), stagedSubpackPath, injectedFile.targetPath);
    }

    fs.rmSync(path.join(stagedSubpackPath, "manifest.json"), { force: true });
  }
}

function getDeploymentPath(): string {
  const product = getOrThrowFromProcess("MINECRAFT_PRODUCT") as keyof ReturnType<typeof getGameDeploymentRootPaths>;
  const deploymentPath = getGameDeploymentRootPaths()[product];
  if (deploymentPath === undefined) {
    throw new Error("Deployment path is undefined. Make sure to configure package root correctly.");
  }
  return deploymentPath;
}

function deployPack(sourcePath: string, destinationPath: string): void {
  fs.rmSync(destinationPath, { recursive: true, force: true });
  copyFiles([sourcePath], destinationPath);
}

function copyArtifacts(): void {
  const deploymentPath = getDeploymentPath();
  deployPack(behaviorPackSource, path.join(deploymentPath, developmentBehaviorPacksPath, projectName));
  deployPack(scriptsSource, path.join(deploymentPath, developmentBehaviorPacksPath, projectName, "scripts"));
  deployPack(stagedMainResourcePack, path.join(deploymentPath, developmentResourcePacksPath, projectName));
}

function cleanObsoleteStandaloneResourcePacks(): void {
  const deploymentPath = getDeploymentPath();
  for (const packName of obsoleteStandaloneResourcePackNames) {
    fs.rmSync(path.join(deploymentPath, developmentResourcePacksPath, packName), {
      recursive: true,
      force: true,
    });
  }
}

task("lint", coreLint(["scripts/**/*.ts"], argv().fix));
task("typescript", tscTask());
task("bundle", bundleTask(bundleTaskOptions));
task("build", series("typescript", "bundle"));
task("clean-local", cleanTask(DEFAULT_CLEAN_DIRECTORIES));
task("clean-standard-collateral", cleanCollateralTask(STANDARD_CLEAN_PATHS));
task("clean-obsolete-standalone-resource-packs", cleanObsoleteStandaloneResourcePacks);
task("clean-collateral", parallel("clean-standard-collateral", "clean-obsolete-standalone-resource-packs"));
task("clean", parallel("clean-local", "clean-collateral"));
task("stageMainResourcePack", stageMainResourcePack);
task("copyArtifacts", series("stageMainResourcePack", copyArtifacts));
task("package", series("clean-collateral", "copyArtifacts"));
task(
  "local-deploy",
  watchTask(
    ["scripts/**/*.ts", "behavior_packs/**/*.{json,lang,tga,ogg,png}", "resource_packs/**/*.{json,lang,tga,ogg,png}"],
    series("clean-local", "build", "package")
  )
);
task(
  "packBP",
  zipTask(behaviorPackMcpack, [
    { contents: [behaviorPackSource] },
    { contents: [scriptsSource], targetPath: "scripts" },
  ])
);
task("packMainRP", zipTask(mainResourcePackMcpack, [{ contents: [stagedMainResourcePack] }]));
task(
  "packMcaddon",
  zipTask(`${packagesRoot}/${projectName}.mcaddon`, [
    {
      contents: [behaviorPackMcpack, mainResourcePackMcpack],
    },
  ])
);
task("createMcaddonFile", series("stageMainResourcePack", parallel("packBP", "packMainRP"), "packMcaddon"));
task("mcaddon", series("clean-local", "build", "createMcaddonFile"));
