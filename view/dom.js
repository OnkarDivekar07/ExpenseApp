const container = document.getElementById('container');
const overlayCon = document.getElementById('overlayCon');
const overlayBtn = document.getElementById('overlayBtn');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('Password'); // Note the capital "P"
const signUpButton = document.getElementById('signup');

overlayBtn.addEventListener('click', () => {
    container.classList.toggle('right-panel-active');
});

signUpButton.addEventListener('click', (event) => {
    event.preventDefault();
    
    const data = {
        name: nameInput.value, // Use nameInput, not name
        email: emailInput.value,
        password: passwordInput.value, // Use passwordInput, not password
    };

    console.log(data);

    axios.post('http://localhost:4000/user/signup', data)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            alert('this account already exist')
            console.error(error);
        });
});
