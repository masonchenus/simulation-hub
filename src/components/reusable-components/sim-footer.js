export class SimFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const year = new Date().getFullYear();
        const version = this.getAttribute('version') || '1.0.0';
        const links = this.getAttribute('links') ? JSON.parse(this.getAttribute('links')) : [];

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                margin-top: 4rem;
                font-family: "Space Grotesk", system-ui, sans-serif;
            }
            footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
                font-size: 0.85rem;
                color: #4d463a;
                border-top: 1px dashed rgba(18, 16, 12, 0.15);
                padding-top: 16px;
                padding-bottom: 8px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 16px;
                padding-left: 14px;
                padding-right: 14px;
            }
            ::slotted(a) {
                color: inherit;
                text-decoration: none;
                font-weight: 600;
            }
            .meta {
                opacity: 0.6;
                font-size: 0.75rem;
            }
            .links {
                display: flex;
                gap: 12px;
            }
        </style>
        <footer>
            <slot></slot>
            <div class="links">
                ${links.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}
            </div>
            <div class="meta">
                <span>© ${year} Simulation Hub v${version}</span>
            </div>
        </footer>
        `;
    }
}

customElements.define('sim-footer', SimFooter);