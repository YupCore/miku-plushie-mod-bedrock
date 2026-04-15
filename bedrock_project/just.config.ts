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
const packagesRoot = "./dist/packages";
const developmentBehaviorPacksPath = "development_behavior_packs";
const developmentResourcePacksPath = "development_resource_packs";
const mainResourcePackMcpack = `${packagesRoot}/${projectName}_rp.mcpack`;
const behaviorPackMcpack = `${packagesRoot}/${projectName}_bp.mcpack`;
const englishDubResourcePackMcpack = `${packagesRoot}/${projectName}_en_us_dub_rp.mcpack`;
const legacyTexturesResourcePackMcpack = `${packagesRoot}/${projectName}_legacy_textures_rp.mcpack`;

type OverlayResourcePack = {
  deployedName: string;
  sourcePath: string;
  stagedPath: string;
  injectedFiles: Array<{ sourcePath: string; targetPath: string }>;
};

const overlayResourcePacks: OverlayResourcePack[] = [
  {
    deployedName: `${projectName}_en_us_dub`,
    sourcePath: "./subpacks/en_us_dub",
    stagedPath: `${stagedResourcePackRoot}/${projectName}_en_us_dub`,
    injectedFiles: [
      {
        sourcePath: `${mainResourcePackSource}/sounds/sound_definitions.json`,
        targetPath: "sounds/sound_definitions.json",
      },
      {
        sourcePath: `${mainResourcePackSource}/pack_icon.png`,
        targetPath: "pack_icon.png",
      },
    ],
  },
  {
    deployedName: `${projectName}_legacy_textures`,
    sourcePath: "./subpacks/legacy_textures",
    stagedPath: `${stagedResourcePackRoot}/${projectName}_legacy_textures`,
    injectedFiles: [
      {
        sourcePath: `${mainResourcePackSource}/textures/terrain_texture.json`,
        targetPath: "textures/terrain_texture.json",
      },
      {
        sourcePath: `${mainResourcePackSource}/pack_icon.png`,
        targetPath: "pack_icon.png",
      },
    ],
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

function copyInjectedFile(sourcePath: string, destinationRoot: string, targetPath: string): void {
  const destinationPath = path.join(destinationRoot, targetPath);
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
}

function readJsonFile(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function validateOverlayResourcePackManifests(): void {
  const mainManifest = readJsonFile(projectPath(`${mainResourcePackSource}/manifest.json`));
  const mainResourcePackUuid = mainManifest.header.uuid;
  const mainResourcePackVersion = JSON.stringify(mainManifest.header.version);
  const seenUuids = new Map<string, string>();

  function registerUuid(uuid: string, owner: string): void {
    const existingOwner = seenUuids.get(uuid);
    if (existingOwner !== undefined) {
      throw new Error(`Resource pack manifest UUID collision: ${uuid} is used by both ${existingOwner} and ${owner}.`);
    }
    seenUuids.set(uuid, owner);
  }

  registerUuid(mainManifest.header.uuid, "main resource pack header");
  for (const module of mainManifest.modules ?? []) {
    registerUuid(module.uuid, `main resource pack module ${module.description ?? module.type ?? ""}`.trim());
  }

  for (const overlay of overlayResourcePacks) {
    const manifest = readJsonFile(projectPath(`${overlay.sourcePath}/manifest.json`));
    registerUuid(manifest.header.uuid, `${overlay.deployedName} header`);
    for (const module of manifest.modules ?? []) {
      registerUuid(module.uuid, `${overlay.deployedName} module ${module.description ?? module.type ?? ""}`.trim());
    }

    const dependsOnMainResourcePack = (manifest.dependencies ?? []).some(
      (dependency: { uuid: string; version: number[] }) =>
        dependency.uuid === mainResourcePackUuid && JSON.stringify(dependency.version) === mainResourcePackVersion
    );
    if (!dependsOnMainResourcePack) {
      throw new Error(`${overlay.deployedName} must depend on main resource pack ${mainResourcePackUuid}.`);
    }
  }
}

function stageOverlayResourcePacks(): void {
  validateOverlayResourcePackManifests();
  fs.rmSync(projectPath(stagedResourcePackRoot), { recursive: true, force: true });

  for (const overlay of overlayResourcePacks) {
    const stagedPath = projectPath(overlay.stagedPath);
    copyDirectoryContents(projectPath(overlay.sourcePath), stagedPath);

    for (const injectedFile of overlay.injectedFiles) {
      copyInjectedFile(projectPath(injectedFile.sourcePath), stagedPath, injectedFile.targetPath);
    }
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
  deployPack(mainResourcePackSource, path.join(deploymentPath, developmentResourcePacksPath, projectName));

  for (const overlay of overlayResourcePacks) {
    deployPack(overlay.stagedPath, path.join(deploymentPath, developmentResourcePacksPath, overlay.deployedName));
  }
}

function cleanOverlayCollateral(): void {
  const deploymentPath = getDeploymentPath();
  for (const overlay of overlayResourcePacks) {
    fs.rmSync(path.join(deploymentPath, developmentResourcePacksPath, overlay.deployedName), {
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
task("clean-overlay-collateral", cleanOverlayCollateral);
task("clean-collateral", parallel("clean-standard-collateral", "clean-overlay-collateral"));
task("clean", parallel("clean-local", "clean-collateral"));
task("stageOverlayResourcePacks", stageOverlayResourcePacks);
task("copyArtifacts", series("stageOverlayResourcePacks", copyArtifacts));
task("package", series("clean-collateral", "copyArtifacts"));
task(
  "local-deploy",
  watchTask(
    [
      "scripts/**/*.ts",
      "behavior_packs/**/*.{json,lang,tga,ogg,png}",
      "resource_packs/**/*.{json,lang,tga,ogg,png}",
      "subpacks/**/*.{json,lang,tga,ogg,png}",
    ],
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
task("packMainRP", zipTask(mainResourcePackMcpack, [{ contents: [mainResourcePackSource] }]));
task("packEnglishDubRP", zipTask(englishDubResourcePackMcpack, [{ contents: [overlayResourcePacks[0].stagedPath] }]));
task(
  "packLegacyTexturesRP",
  zipTask(legacyTexturesResourcePackMcpack, [{ contents: [overlayResourcePacks[1].stagedPath] }])
);
task(
  "packMcaddon",
  zipTask(`${packagesRoot}/${projectName}.mcaddon`, [
    {
      contents: [
        behaviorPackMcpack,
        mainResourcePackMcpack,
        englishDubResourcePackMcpack,
        legacyTexturesResourcePackMcpack,
      ],
    },
  ])
);
task(
  "createMcaddonFile",
  series(
    "stageOverlayResourcePacks",
    parallel("packBP", "packMainRP", "packEnglishDubRP", "packLegacyTexturesRP"),
    "packMcaddon"
  )
);
task("mcaddon", series("clean-local", "build", "createMcaddonFile"));
