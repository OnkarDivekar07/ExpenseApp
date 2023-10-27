
const form = document.querySelector('#form');
const button = document.getElementById('button');


form.addEventListener('submit', saveExpense);

async function saveExpense(event) {
    event.preventDefault();
    const amount = event.target.amount.value;
    const description = event.target.description.value;
    const catogary = event.target.catogary.value;

    const expenseData = {
        amount,
        description,
        catogary,
    };

    console.log(expenseData);

    try {
        console.log(button.dataset.id)
        if (button.dataset.id) {
            const expenseId = button.dataset.id;
            const res = await axios.put(`http://localhost:4000/user/editexpense/${expenseId}`,expenseData);
            console.log('expense updated'); // Log a message indicating the expense was updated

            buttons(res.data)

        } else {
            const token = localStorage.getItem('token')
            const res = await axios.post('http://localhost:4000/user/postexpense', expenseData, { headers: { "Authorization": token } });
            console.log('expense added');
            buttons(res.data);
        }
    } catch (error) {
        console.error(error);
    }

    button.dataset.id = '';
}



function buttons(responsedata) {
    const row = document.createElement('tr');


    const amountCell = document.createElement('td');
    amountCell.textContent = responsedata.amount;
    row.appendChild(amountCell);

    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = responsedata.description;
    row.appendChild(descriptionCell);

    const categoryCell = document.createElement('td');
    categoryCell.textContent = responsedata.catogary;
    row.appendChild(categoryCell);

    const actionCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.className = 'btn btn-secondary';
    editButton.textContent = 'Edit';
    editButton.onclick = () => {
        document.getElementById('amount').value = responsedata.amount
        document.getElementById('catogary').value = responsedata.catogary
        document.getElementById('description').value = responsedata.description
        document.getElementById('button').dataset.id = responsedata.id;
        userTableBody.removeChild(row);
    };
    actionCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-secondary';
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => {
        const deleteid = responsedata.id;
        axios.delete(`http://localhost:4000/user/deleteexpense/${deleteid}`)
            .then((response) => {
                console.log(response)
            })
            .catch((err) => {
                console.log(err);
            })
        userTableBody.removeChild(row);
    };
    actionCell.appendChild(deleteButton);

    row.appendChild(actionCell);

    // Append the row to the table body
    userTableBody.appendChild(row);
}

document.getElementById('paybutton').onclick = async function (e) {
    const token = localStorage.getItem('token');
   // console.log(token)
        const response = await axios.get('http://localhost:4000/user/purchasepremium',{
            headers: {
                "Authorization": token
            }
        });

// console.log(response);  
    var options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        "handler":async function (response){
        await axios.post('http://localhost:4000/user/updatetranctionstatus', {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
        }, {
            headers: {
                "Authorization": token
            }
        });
            alert('Congratulations! You are now a premium user.');
            document.getElementById('paybutton').textContent = 'You are a Premium User';
    }
    }
    console.log(options)
    const rzpl= new Razorpay(options)
    rzpl.open()
    e.preventDefault();
    rzpl.on('payment failed',function(response){
        console.log(response)
        alert('something went wrong')
    })
};





