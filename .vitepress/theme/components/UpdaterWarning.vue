<script setup lang="ts">
import { computed, inject } from "vue";
import { useI18n, useSerialConnection } from "../composables";

defineProps<{
    isOverDropZone: boolean;
    uploadedFile: File | null;
    isMatchingRelease: boolean;
}>();

const { tr, getLocalizedPath } = useI18n();
const serialConnection = inject<ReturnType<typeof useSerialConnection> | null>("serialConnection");

const currentDeviceVersion = computed(
    () => serialConnection?.connectionData.deviceInfo?.firmware_version,
);
</script>

<template>
    <Transition name="fade-drop" mode="out-in">
        <div
            v-if="isMatchingRelease"
            class="flex flex-col w-full bg-yellow-300/15 dark:bg-orange-800/5 sm:rounded-lg border-y sm:border border-yellow-400/20 dark:border-orange-300/15"
            :class="{
                'opacity-40': isOverDropZone,
            }"
        >
            <div
                class="flex flex-row items-center justify-center gap-2.5 lg:gap-1.5 w-full py-1.5 px-2.5 min-h-10 lg:h-10"
            >
                <div class="flex-shrink-0 h-full flex items-center justify-center">
                    <v-icon
                        name="ri-error-warning-line"
                        :scale="1.0"
                        class="text-yellow-600 dark:text-orange-400/90 p-0.5 mb-px"
                    />
                </div>
                <span
                    class="text-xs font-medium text-yellow-700 dark:text-orange-500 flex flex-col md:flex-row gap-1 lg:gap-1.5 pt-1 pb-1.5 lg:pt-0 lg:pb-0 select-none"
                >
                    {{
                        tr("updater_matching_release_warning", {
                            type: uploadedFile
                                ? tr("updater_upload_file")
                                : tr("updater_select_release"),
                        })
                    }}
                    <div class="flex flex-row gap-px">
                        <a
                            class="font-medium text-yellow-950/90 dark:text-orange-100/90 hover:underline underline underline-offset-4 dark:decoration-orange-200/20 decoration-yellow-950/20 hover:decoration-yellow-950/50 dark:hover:decoration-orange-200/40 transition-all duration-100 vp-external-link-icon"
                            :href="`${getLocalizedPath('/releases')}/${currentDeviceVersion}`"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {{ currentDeviceVersion }}
                        </a>
                    </div>
                </span>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.fade-drop-enter-active,
.fade-drop-leave-active {
    transition: all 0.4s ease-out;
}

.fade-drop-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.fade-drop-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.fade-drop-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.fade-drop-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>
