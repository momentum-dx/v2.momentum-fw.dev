import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ofetch } from "ofetch";
import {
    FIRMWARE_FILES_URL,
    FIRMWARE_REPO,
    MAX_RELEASES,
    RELEASE_TAG_PREFIX,
} from "../.vitepress/site";
import { DIR_DATA, HEADER, jsonToTypeScript } from "./utils";

interface GithubAsset {
    name: string;
    size: number;
    browser_download_url: string;
}

interface GithubRelease {
    tag_name: string;
    draft: boolean;
    prerelease: boolean;
    published_at: string;
    body: string | null;
    assets: GithubAsset[];
}

interface DirectoryFile {
    url: string;
    target: string;
    type: string;
    sha256: string;
}

interface ReleaseFile {
    filename: string;
    size: string;
    url: string;
}

interface ReleaseItem {
    version: string;
    date: string;
    timestamp: number;
    changelog: string;
    files: ReleaseFile[];
}

const PUBLIC_DIR = resolve(DIR_DATA, "../public");
const BUILDS_DIR = join(PUBLIC_DIR, "builds/firmware");
const FIRMWARE_DIR = join(PUBLIC_DIR, "firmware");
const MAX_ARTIFACT_BYTES = 800 * 1024 * 1024;
const FILE_NAME = /^flipper-z-(\w+)-(\w+)-dx-[\w.-]+\.(\w+)$/;
const USER_AGENT = "Momentum-dx-Website";

async function fetchGithubReleases(): Promise<GithubRelease[]> {
    const fixture = process.env.RELEASES_FIXTURE;
    if (fixture) {
        console.log(`  Reading releases from fixture ${fixture}`);
        return JSON.parse(await fs.readFile(fixture, "utf8"));
    }

    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const releases = await ofetch<GithubRelease[]>(
        `https://api.github.com/repos/${FIRMWARE_REPO}/releases`,
        {
            query: { per_page: 100 },
            timeout: 20000,
            headers: {
                "User-Agent": USER_AGENT,
                Accept: "application/vnd.github+json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        },
    );
    if (!Array.isArray(releases)) {
        throw new Error("Invalid releases response from GitHub");
    }
    return releases;
}

export function selectReleases(releases: GithubRelease[]): GithubRelease[] {
    return releases
        .filter((r) => !r.draft && !r.prerelease && r.tag_name.startsWith(RELEASE_TAG_PREFIX))
        .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
        .slice(0, MAX_RELEASES);
}

async function readAsset(asset: GithubAsset, dest: string): Promise<Buffer> {
    const cached = await fs.readFile(dest).catch(() => null);
    if (cached && cached.length === asset.size) return cached;

    const url = asset.browser_download_url;
    if (url.startsWith("file://")) return fs.readFile(fileURLToPath(url));

    const bytes = await ofetch<ArrayBuffer>(url, {
        responseType: "arrayBuffer",
        timeout: 120000,
        retry: 2,
        headers: { "User-Agent": USER_AGENT },
    });
    return Buffer.from(bytes);
}

function formatSize(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function importRelease(
    release: GithubRelease,
    totalBytes: { value: number },
): Promise<{ item: ReleaseItem; files: DirectoryFile[] }> {
    const tag = release.tag_name;
    const dir = join(BUILDS_DIR, tag);
    await fs.mkdir(dir, { recursive: true });

    const item: ReleaseItem = {
        version: tag,
        date: new Date(release.published_at).toISOString().split("T")[0],
        timestamp: Math.floor(Date.parse(release.published_at) / 1000),
        changelog: (release.body || "").replace(/\r/g, "").trim(),
        files: [],
    };
    const files: DirectoryFile[] = [];

    for (const asset of release.assets) {
        const match = asset.name.match(FILE_NAME);
        if (!match || !asset.name.includes(`-${tag}.`)) continue;

        const data = await readAsset(asset, join(dir, asset.name));
        totalBytes.value += data.length;
        if (totalBytes.value > MAX_ARTIFACT_BYTES) {
            throw new Error(`Firmware files exceed ${MAX_ARTIFACT_BYTES} bytes`);
        }
        await fs.writeFile(join(dir, asset.name), data);

        const url = `${FIRMWARE_FILES_URL}/${tag}/${asset.name}`;
        item.files.push({ filename: asset.name, size: formatSize(data.length), url });
        files.push({
            url,
            target: match[1],
            type: `${match[2]}_${match[3]}`,
            sha256: createHash("sha256").update(data).digest("hex"),
        });
    }

    console.log(`  ${tag}: ${item.files.length} files`);
    return { item, files };
}

export function buildDirectory(latest: ReleaseItem | undefined, files: DirectoryFile[]) {
    return {
        channels: [
            {
                id: "release",
                title: "Stable Release Channel",
                description: "Less frequent, more stable releases",
                versions: latest
                    ? [
                          {
                              version: latest.version,
                              changelog: latest.changelog,
                              timestamp: latest.timestamp,
                              files,
                          },
                      ]
                    : [],
            },
        ],
    };
}

async function writeReleasesData(releases: ReleaseItem[]): Promise<void> {
    const content = `${HEADER}

export interface ReleaseFile {
    filename: string;
    size: string;
    url: string;
}

export interface ReleaseItem {
    version: string;
    date: string;
    timestamp: number;
    changelog: string;
    files: ReleaseFile[];
}

export const mainlineReleases: ReleaseItem[] = ${jsonToTypeScript(releases)};

export const recentReleases = { mainline: mainlineReleases };

export const getReleaseByVersion = (version: string) => {
    return mainlineReleases.find((release) => release.version === version);
};
`;
    await fs.writeFile(join(DIR_DATA, "releases.ts"), content, "utf8");
    console.log("  Generated: _data/releases.ts");
}

export async function fetchReleases() {
    const selected = selectReleases(await fetchGithubReleases());
    console.log(`  Found ${selected.length} releases: ${selected.map((r) => r.tag_name).join(", ")}`);

    await fs.mkdir(BUILDS_DIR, { recursive: true });
    for (const entry of await fs.readdir(BUILDS_DIR)) {
        if (!selected.some((r) => r.tag_name === entry)) {
            await fs.rm(join(BUILDS_DIR, entry), { recursive: true, force: true });
        }
    }

    const totalBytes = { value: 0 };
    const items: ReleaseItem[] = [];
    let latestFiles: DirectoryFile[] = [];
    for (const release of selected) {
        const { item, files } = await importRelease(release, totalBytes);
        if (items.length === 0) latestFiles = files;
        items.push(item);
    }

    await fs.mkdir(FIRMWARE_DIR, { recursive: true });
    await fs.writeFile(
        join(FIRMWARE_DIR, "directory.json"),
        JSON.stringify(buildDirectory(items[0], latestFiles), null, 2) + "\n",
    );
    await fs.writeFile(join(FIRMWARE_DIR, "latest.txt"), items[0]?.version ?? "");
    console.log(`  Wrote firmware/directory.json and latest.txt (${formatSize(totalBytes.value)})`);

    await writeReleasesData(items);
    console.log("Releases generated successfully");
}
