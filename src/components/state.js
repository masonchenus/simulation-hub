export let keys = Number(localStorage.getItem("simhub-keys") || "0");
export const unlockedApps = JSON.parse(localStorage.getItem("simhub-unlocked-apps") || "[]");
export const unlockedAll = localStorage.getItem("simhub-unlocked-all") === "true";

export function addUnlockedApp(appId) {
    if (!unlockedApps.includes(appId)) {
        unlockedApps.push(appId);
        localStorage.setItem("simhub-unlocked-apps", JSON.stringify(unlockedApps));
    }
}

export function spendKey() {
    keys = Math.max(0, keys - 1);
    localStorage.setItem("simhub-keys", String(keys));
    return keys;
}