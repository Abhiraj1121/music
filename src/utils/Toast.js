// Lightweight, dependency-free toast notifications.
export class Toast {
    constructor() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 3500) {
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.textContent = message;
        this.container.appendChild(el);

        // Force reflow then animate in
        requestAnimationFrame(() => el.classList.add('show'));

        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 300);
        }, duration);
    }

    error(message) { this.show(message, 'error'); }
    success(message) { this.show(message, 'success'); }
    info(message) { this.show(message, 'info'); }
}
