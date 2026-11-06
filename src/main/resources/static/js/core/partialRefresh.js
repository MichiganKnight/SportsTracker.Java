document.addEventListener("DOMContentLoaded", () => {
    updateLastRefresh();
});

const refreshControllers = new Map();

function updateLastRefresh(date = new Date()) {
    const element = document.querySelector("[data-last-refresh]");

    if (!element) {
        return;
    }

    element.textContent = date.toLocaleString([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
    });
}

async function refreshPartial({selector, url, replacementSelector = selector, beforeReplace = null, afterReplace = null}) {
    const current = document.querySelector(selector);
    
    if (!current) {
        return false;
    }
    
    refreshControllers.get(selector)?.abort();
    
    const controller = new AbortController();
    
    refreshControllers.set(selector, controller);
    
    const state = beforeReplace?.(current) ?? null;
    
    try {
        const response = await fetch(url, {
            cache: "no-store",
            signal: controller.signal
        });

        if (!response.ok) {
            console.error(`Unable to Refresh ${selector}: ${response.status}`);

            return false;
        }

        const html = await response.text();

        const documentFragment = new DOMParser().parseFromString(html, "text/html");

        const replacement = documentFragment.querySelector(replacementSelector);

        if (!replacement) {
            console.error(`Replacement Element Not Found: ${replacementSelector}`);

            return false;
        }

        current.replaceWith(replacement);

        afterReplace?.(replacement, state);

        updateLastRefresh();

        return true;
    } catch (error) {
        if (error.name !== "AbortError") {
            console.error(`Unable to Refresh ${selector}:`, error);
        }
        
        return false;
    } finally {
        if (refreshControllers.get(selector) === controller) {
            refreshControllers.delete(selector);
        }
    }
}