const container = document.getElementById('container');
const overlayCon = document.getElementById('overlayCon');
const overlayBtn = document.getElementById('overlayBtn');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('Password'); 
const signUpButton = document.getElementById('signup');
const loginemail = document.getElementById('loginemail')
const loginpassword = document.getElementById('loginpassword')
const loginbutton = document.getElementById('login')
const message = document.getElementById('message')
const signupmessage = document.getElementById('signupmessage')

overlayBtn.addEventListener('click', () => {
    container.classList.toggle('right-panel-active');
});

signUpButton.addEventListener('click', (event) => {
    event.preventDefault();
    
    const data = {
        name: nameInput.value, 
        email: emailInput.value,
        password: passwordInput.value,
    };

    console.log(data);

    axios.post('http://localhost:4000/user/signup', data)
        .then(response => {
            console.log(response.data.success);
            if (response.data.success) {
                alert('Account created successfully');
            } else {
                // Handle the case where the response indicates an error
                signupmessage.innerHTML = 'This Account already exists';
                signupmessage.style.color = 'red';
                setTimeout(() => signupmessage.remove(), 5000);
            }
        })
        .catch(err => {
            console.log(err);
            // Handle network or other errors here
            signupmessage.innerHTML = 'An error occurred';
            signupmessage.style.color = 'red';
            setTimeout(() => signupmessage.remove(), 5000);
        });
    })

loginbutton.addEventListener('click', (event) => {
    event.preventDefault();

    const data = {
        email: loginemail.value,
        password: loginpassword.value,
    };

    console.log(data);

    axios.post('http://localhost:4000/user/login', data)
        .then(response => {
            if (response.data.success) {
               
                alert('Login successful');
            } else {
                message.innerHTML = 'Invalid email or password';
                message.style.color = 'red'
                setTimeout(() => message.remove(), 5000);
            }
        })
        .catch(error => {
            alert('An error occurred during login');
            console.log(error);
        });
});