import { mainlineReleases } from "../_data/releases";

export default {
    paths: () => mainlineReleases.map((release) => ({ params: { version: release.version } })),
};
