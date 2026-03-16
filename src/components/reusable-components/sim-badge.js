export class SimBadge extends HTMLElement {
    static observedAttributes = ["text", "color", "variant", "size", "icon", "subtext", "hint", "pulse", "glow"];

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        if (!this.shadowRoot) return;

        const text = this.getAttribute("text") || "";
        const color = this.getAttribute("color") || "#d94834";
        const variant = this.getAttribute("variant") || "solid"; // solid, outline, ghost, glass, neon
        const size = this.getAttribute("size") || "md"; // sm, md, lg
        const icon = this.getAttribute("icon") || "";
        const subtext = this.getAttribute("subtext") || "";
        const hint = this.getAttribute("hint") || "";
        const pulse = this.hasAttribute("pulse") || this.getAttribute("pulse") === "true";
        const glow = this.hasAttribute("glow") || this.getAttribute("glow") === "true";

        const fontSize = size === "sm" ? "0.66rem" : size === "lg" ? "0.78rem" : "0.72rem";
        const padY = size === "sm" ? "5px" : size === "lg" ? "7px" : "6px";
        const padX = size === "sm" ? "10px" : size === "lg" ? "12px" : "11px";
        const iconSize = size === "sm" ? "18px" : size === "lg" ? "22px" : "20px";

        this.shadowRoot.replaceChildren();

        const style = document.createElement("style");
        style.textContent = `
            :host {
                display: inline-block;
                font-family: "Space Grotesk", system-ui, sans-serif, copperplate;
            }

            .badge {
                --badge-color: ${color};
                display: inline-flex;
                align-items: center;
                gap: ${size === "sm" ? "8px" : "10px"};
                font-size: ${fontSize};
                font-weight: 650;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                padding: ${padY} ${padX};
                border-radius: 999px;
                position: relative;
                isolation: isolate;
                transform: translateZ(0);
                transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
            }

            .badge:hover {
                transform: translateY(-1px);
            }

            .badge::after {
                content: "";
                position: absolute;
                inset: -1px;
                border-radius: inherit;
                pointer-events: none;
                opacity: 0;
                background: linear-gradient(
                    120deg,
                    transparent 0%,
                    color-mix(in srgb, var(--badge-color) 30%, rgba(255, 255, 255, 0.9)) 35%,
                    transparent 70%
                );
                mix-blend-mode: overlay;
                transform: translateX(-35%);
            }

            .badge:hover::after {
                opacity: 0.9;
                animation: glint 900ms ease both;
            }

            .badge.solid {
                background: linear-gradient(
                    120deg,
                    color-mix(in srgb, var(--badge-color) 18%, #fff),
                    color-mix(in srgb, var(--badge-color) 10%, #fff)
                );
                color: #12100c;
                border: 1px solid color-mix(in srgb, var(--badge-color) 40%, rgba(18, 16, 12, 0.12));
                box-shadow: 0 14px 26px -22px rgba(18, 16, 12, 0.55);
            }

            .badge.outline {
                background: transparent;
                color: var(--badge-color);
                border: 1px solid color-mix(in srgb, var(--badge-color) 80%, rgba(18, 16, 12, 0.08));
                box-shadow: none;
            }

            .badge.ghost {
                background: color-mix(in srgb, var(--badge-color) 10%, transparent);
                color: var(--badge-color);
                border: 1px solid color-mix(in srgb, var(--badge-color) 20%, transparent);
                box-shadow: none;
            }

            .badge.glass {
                background: color-mix(in srgb, var(--badge-color) 10%, rgba(255, 255, 255, 0.65));
                color: #12100c;
                border: 1px solid color-mix(in srgb, var(--badge-color) 35%, rgba(18, 16, 12, 0.12));
                box-shadow:
                    inset 0 0 0 1px rgba(255, 255, 255, 0.55),
                    0 16px 30px -26px rgba(18, 16, 12, 0.55);
                backdrop-filter: blur(10px);
            }

            .badge.neon {
                background: #000;
                color: #fff;
                border: 1px solid var(--badge-color);
                box-shadow: 0 0 10px color-mix(in srgb, var(--badge-color) 50%, transparent),
                            inset 0 0 5px color-mix(in srgb, var(--badge-color) 30%, transparent);
            }

            .dot {
                width: 10px;
                height: 10px;
                border-radius: 999px;
                background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), color-mix(in srgb, var(--badge-color) 60%, #000));
                box-shadow: 0 0 0 5px color-mix(in srgb, var(--badge-color) 16%, transparent);
                flex: 0 0 auto;
            }

            .icon {
                width: ${iconSize};
                height: ${iconSize};
                display: inline-grid;
                place-items: center;
                border-radius: 999px;
                background: color-mix(in srgb, var(--badge-color) 14%, rgba(255, 255, 255, 0.85));
                border: 1px solid color-mix(in srgb, var(--badge-color) 34%, rgba(18, 16, 12, 0.08));
                box-shadow: 0 10px 20px -20px rgba(18, 16, 12, 0.55);
                font-size: ${size === "sm" ? "0.9rem" : size === "lg" ? "1.02rem" : "0.96rem"};
                line-height: 1;
            }

            .text {
                display: inline-flex;
                flex-direction: column;
                gap: 2px;
                line-height: 1.05;
                min-width: 0;
            }

            .text .main {
                white-space: nowrap;
            }

            .text .sub {
                font-size: ${size === "sm" ? "0.56rem" : "0.6rem"};
                letter-spacing: 0.14em;
                opacity: 0.72;
                text-transform: none;
                font-weight: 600;
                font-family: ui-sans-serif, system-ui, sans-serif;
            }

            .pulse {
                position: absolute;
                inset: -2px;
                border-radius: inherit;
                pointer-events: none;
                background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--badge-color) 22%, transparent), transparent 55%);
                opacity: 0;
                z-index: -1;
            }

            .badge[data-pulse="true"] .pulse {
                opacity: 1;
                animation: pulse 1600ms ease-in-out infinite;
            }

            .badge[data-glow="true"] {
                box-shadow: 0 0 15px color-mix(in srgb, var(--badge-color) 40%, transparent);
            }

            @media (prefers-reduced-motion: reduce) {
                .badge,
                .badge:hover {
                    transition: none;
                    transform: none;
                }
                .badge:hover::after {
                    animation: none;
                }
                .badge[data-pulse="true"] .pulse {
                    animation: none;
                }
            }

            @keyframes glint {
                0% { transform: translateX(-40%); }
                100% { transform: translateX(40%); }
            }

            @keyframes pulse {
                0%, 100% { transform: scale(0.98); filter: blur(0px); }
                50% { transform: scale(1.04); filter: blur(0.5px); }
            }
        `;

        const badge = document.createElement("span");
        badge.className = `badge ${variant}`;
        badge.setAttribute("data-pulse", pulse ? "true" : "false");
        badge.setAttribute("data-glow", glow ? "true" : "false");
        badge.setAttribute("role", "note");
        badge.setAttribute("aria-label", subtext ? `${text} — ${subtext}` : text);
        if (hint) badge.title = hint;

        const pulseEl = document.createElement("span");
        pulseEl.className = "pulse";
        badge.appendChild(pulseEl);

        const dot = document.createElement("span");
        dot.className = "dot";
        badge.appendChild(dot);

        if (icon) {
            const iconEl = document.createElement("span");
            iconEl.className = "icon";
            iconEl.textContent = icon;
            badge.appendChild(iconEl);
        }

        const textEl = document.createElement("span");
        textEl.className = "text";
        const main = document.createElement("span");
        main.className = "main";
        main.textContent = text;
        textEl.appendChild(main);
        if (subtext) {
            const sub = document.createElement("span");
            sub.className = "sub";
            sub.textContent = subtext;
            textEl.appendChild(sub);
        }
        badge.appendChild(textEl);

        this.shadowRoot.append(style, badge);
    }
}
customElements.define('sim-badge', SimBadge);
