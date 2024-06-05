class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        }

        this.state = false;
        this.messages = [];
    }

    display() {
        const { openButton, chatBox, sendButton } = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if (this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    /*
    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        fetch('https://principal-beret-mateu-jp-d924949a.koyeb.app/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(r => r.json())
            .then(r => {
                let msg2 = { name: "Mini Bites", message: r.answer };
                this.messages.push(msg2);
                this.updateChatText(chatbox)
                textField.value = ''

            }).catch((error) => {
                console.error('Error:', error);
                this.updateChatText(chatbox)
                textField.value = ''
            });
    }
    */
    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text = textField.value;
        if (text === "") {
            return;
        }

        let userMsg = { name: "User", message: text };
        this.messages.push(userMsg);
        this.updateChatText(chatbox);
        textField.value = '';

        // Muestra un indicador de carga en la UI
        this.showLoadingIndicator(chatbox);

        fetch('https://principal-beret-mateu-jp-d924949a.koyeb.app/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(r => r.json())
            .then(r => {
                let botMsg = { name: "Mini Bites", message: r.answer };
                this.messages.push(botMsg);
                this.updateChatText(chatbox);
                this.hideLoadingIndicator(chatbox);
            }).catch((error) => {
                console.error('Error:', error);
                this.hideLoadingIndicator(chatbox);
            });
    }

    showLoadingIndicator(chatbox) {
        const loadingIndicator = chatbox.querySelector('.loading-indicator');
        loadingIndicator.style.display = '';
    }

    hideLoadingIndicator(chatbox) {
        const loadingIndicator = chatbox.querySelector('.loading-indicator');
        loadingIndicator.style.display = 'none';
    }




    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function (item, index) {
            if (item.name === "Mini Bites") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            }
            else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
}


const chatbox = new Chatbox();
chatbox.display();