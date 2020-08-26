const Toast = {
    init() {
        this.hideTimeout = null;
        this.el = document.createElement('div');
        this.el.className = 'toast';
        document.body.appendChild(this.el);
    },

    show(message, state) {
        clearTimeout(this.hideTimeout);
        if (state === "success"){
            this.el.innerHTML = `<div><i class="fa fa-check-circle"></i></div>`
        } else if (state === "error"){
            this.el.innerHTML = `<div><i class="fas fa-exclamation-circle"></i></div>`
        }
        this.el.innerHTML += `
            <span>${message}</span>
            <button onclick="this.parentElement.classList.remove('toast--visible')" class="modal-close-button">&times;</button>
            `;
        this.el.className = 'toast toast--visible';

        if (state) {
            this.el.classList.add(`toast--${state}`);
        }

        this.hideTimeout = setTimeout(() => {
            this.el.classList.remove('toast--visible');
        }, 5000)
    }
};

document.addEventListener('DOMContentLoaded', () => Toast.init())
