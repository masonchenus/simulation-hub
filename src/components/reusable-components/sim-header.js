export class SimHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const title = this.getAttribute('title') || 'Simulation Hub';
        const subtitle = this.getAttribute('subtitle') || '';
        const eyebrow = this.getAttribute('eyebrow') || 'Welcome';
        const backHref = this.getAttribute('back-href');
        const backLabel = this.getAttribute('back-label') || 'Back';
        const sticky = this.hasAttribute('sticky');

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                margin-bottom: 2rem;
                font-family: "Space Grotesk", system-ui, sans-serif;
                ${sticky ? `
                    position: sticky;
                    top: 10px;
                    z-index: 100;
                ` : ''}
            }
            header {
                display: grid;
                gap: 18px;
                position: relative;
                padding: 26px 28px;
                border-radius: 26px;
                background: linear-gradient(120deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.52));
                border: 1px solid rgba(18, 16, 12, 0.08);
                box-shadow: 0 30px 70px -40px rgba(18, 16, 12, 0.22);
                color: #12100c;
            }
            header::after {
                content: "";
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(18, 16, 12, 0.2), transparent);
                margin-top: 6px;
            }
            header::before {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: inherit;
                background: linear-gradient(120deg, rgba(255, 255, 255, 0.35), transparent 55%);
                opacity: 0.6;
                pointer-events: none;
            }
            .eyebrow {
                text-transform: uppercase;
                letter-spacing: 0.35em;
                font-size: 0.72rem;
                color: #4d463a;
                font-weight: 600;
            }
            h1 {
                font-family: "Fraunces", serif;
                font-weight: 700;
                font-size: clamp(2.7rem, 5vw, 4rem);
                margin: 0;
                max-width: 16ch;
                line-height: 1.1;
                text-shadow: 0 8px 24px rgba(18, 16, 12, 0.08);
            }
            .subhead {
                font-size: 1.08rem;
                color: #4d463a;
                max-width: 60ch;
                margin: 0;
            }
            .hero-bar {
                height: 8px;
                border-radius: 999px;
                background: rgba(18, 16, 12, 0.08);
                overflow: hidden;
            }
            .hero-bar span {
                display: block;
                height: 100%;
                width: calc(var(--scroll, 0) * 1%);
                background: linear-gradient(90deg, #d94834, #60a5fa);
                transition: width 200ms ease;
            }
            .nav-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            .back-link {
                font-size: 0.8rem;
                text-decoration: none;
                color: #4d463a;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .back-link:hover { color: #d94834; }
        </style>
        <header>
            <div class="nav-row">
                <div class="eyebrow">${eyebrow}</div>
                ${backHref ? `<a href="${backHref}" class="back-link">← ${backLabel}</a>` : ''}
            </div>
            <h1>${title}</h1>
            <p class="subhead">${subtitle}</p>
            <div class="hero-bar"><span></span></div>
            <slot></slot>
        </header>
        `;
    }
}

customElements.define('sim-header', SimHeader);