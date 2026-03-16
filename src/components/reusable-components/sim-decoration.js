export class SimDecoration extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const type = this.getAttribute('type') || 'orb';
        const x = this.getAttribute('x') || '50%';
        const y = this.getAttribute('y') || '50%';
        const size = this.getAttribute('size') || '200px';
        const color = this.getAttribute('color') || 'rgba(255,255,255,0.1)';
        const opacity = this.getAttribute('opacity') || '0.6';

        let content = '';
        let styles = `
            :host {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none;
                z-index: -1;
                overflow: hidden;
            }
        `;

        if (type === 'orb') {
            content = `<div class="orb"></div>`;
            styles += `
                .orb {
                    position: absolute;
                    left: ${x};
                    top: ${y};
                    width: ${size};
                    height: ${size};
                    background: radial-gradient(circle, ${color}, transparent 70%);
                    transform: translate(-50%, -50%);
                    filter: blur(40px);
                    opacity: ${opacity};
                }
            `;
        } else if (type === 'grid') {
            content = `<div class="grid-bg"></div>`;
            styles += `
                .grid-bg {
                    position: absolute; inset: 0;
                    background-image: linear-gradient(${color} 1px, transparent 1px),
                                      linear-gradient(90deg, ${color} 1px, transparent 1px);
                    background-size: ${size} ${size};
                    opacity: ${opacity};
                }
            `;
        } else if (type === 'noise') {
            content = `<div class="noise-bg"></div>`;
            styles += `
                .noise-bg {
                    position: absolute; inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${opacity}'/%3E%3C/svg%3E");
                }
            `;
        } else if (type === 'waves') {
            content = `<div class="waves-bg"></div>`;
            styles += `
                .waves-bg {
                    position: absolute; inset: 0;
                    background: repeating-linear-gradient(
                        45deg,
                        ${color},
                        ${color} 10px,
                        transparent 10px,
                        transparent 20px
                    );
                    opacity: ${opacity};
                    mask-image: linear-gradient(to bottom, black, transparent);
                }
            `;
        }

        this.shadowRoot.innerHTML = `<style>${styles}</style>${content}`;
    }
}

customElements.define('sim-decoration', SimDecoration);