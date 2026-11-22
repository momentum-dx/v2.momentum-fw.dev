<script setup lang="ts">
import { computed } from "vue";
import { mainlineReleases } from "../../../_data/releases";
import { useConnectionInfo, useDots, useThemeSwitcher } from "../composables";

const { dots } = useDots();
const { ifCurrentTheme } = useThemeSwitcher();

const { deviceInfo, isConnected, isConnecting, versionInReleases, tr, getLocalizedPath } =
    useConnectionInfo();

interface ActionButton {
    theme: "brand" | "alt";
    text: string;
    href: string;
    isLatest?: boolean;
}

const dynamicButtons = computed((): ActionButton[] => {
    const defaultButtons: ActionButton[] = [
        {
            theme: "brand",
            text: isConnecting.value ? dots.value : tr("install"),
            href: getLocalizedPath("/update"),
        },
        {
            theme: "alt",
            text: isConnecting.value ? dots.value : tr("nav_releases"),
            href: getLocalizedPath("/releases"),
        },
    ];

    if (!isConnected.value || !deviceInfo) {
        return defaultButtons;
    }

    const currentVersion = deviceInfo.value?.firmware_version || "";
    const latest = mainlineReleases[0];
    if (!latest || !currentVersion.startsWith("dx-")) {
        return defaultButtons;
    }

    const isLatest = currentVersion === latest.version;
    const updateText = isLatest
        ? tr("home_up_to_date")
        : `${tr("home_update_to")} ${latest.version}`;
    const updateHref = isLatest
        ? getLocalizedPath("/update")
        : `${getLocalizedPath("/update")}?version=${latest.version}`;

    const connectedButtons: ActionButton[] = [
        {
            theme: "brand",
            text: updateText,
            href: updateHref,
            isLatest,
        },
        {
            theme: "alt",
            text: versionInReleases ? tr("home_changelog") : tr("nav_releases"),
            href: `${getLocalizedPath("/releases")}/${versionInReleases.value?.version || ""}`,
        },
    ];

    return connectedButtons;
});
</script>

<template>
    <div class="flex flex-wrap items-center justify-center pt-6 sm:pt-8">
        <div class="flex flex-row gap-4 flex-shrink-0 py-1.5">
            <a
                v-for="button in dynamicButtons"
                :key="button.href"
                :href="button.isLatest ? '#' : button.href"
                :class="[
                    'px-7 text-sm leading-9 font-semibold rounded-full border transition-all duration-150 bg-vp-dark/75 backdrop-blur-[1px]',
                    isConnecting ? 'w-[100px]' : '',
                    button.theme === 'brand'
                        ? button.isLatest
                            ? `shadow-grow border-vp-brand-2 dark:border-vp-brand-1 dark:hover:border-vp-brand-2 bg-vp-brand-2 hover:bg-vp-brand-3 text-vp-neutral ${ifCurrentTheme(['orange']) ? 'hover:text-black' : ifCurrentTheme(['white']) ? 'hover:text-vp-neutral-inverse dark:hover:text-vp-neutral-inverse' : 'hover:text-white'}`
                            : `shadow-grow border-vp-brand-1 hover:bg-vp-brand-3 hover:border-vp-brand-2/10 ${ifCurrentTheme(['orange', 'skyline']) ? 'hover:text-black' : ifCurrentTheme(['white']) ? 'hover:text-vp-neutral-inverse dark:hover:text-vp-neutral-inverse' : 'hover:text-white'}`
                        : 'border-vp-border hover:bg-vp-1 dark:hover:bg-vp-border hover:border-vp-3/10 text-vp-1 hover:text-white',
                ]"
                >{{ button.text }}</a
            >
        </div>
    </div>
</template>
