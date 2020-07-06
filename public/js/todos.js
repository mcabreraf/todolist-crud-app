$(document).ready(() => {

    const display = $("#display");
    const form = $("#form");
    const todoUserInput = $("#todoUserInput");
    const message = $("#message");
    message.hide();

    //This func gets the todos in the database. It is connected to the GET request from app.js
    const getTodos = () => {
        fetch("/getTodos",{method : "get"}).then((response)=>{
            return response.json();
        }).then((data) => {
            console.log(data);
            displayTodos(data);
        });
    }

    //Initial call to run everything
    getTodos();
    
    //This func sets the input value to ""
    const resetTodosInput = () => {
        todoUserInput.val("");
    }

    //This func shows the todos from the information given in data (which is database)
    const displayTodos = (data) => {
        data.forEach((todo) => {
            let ids = buildIDS(todo);
            display.append(buildTemplate(todo,ids));
            editTodo(todo, ids.todoID, ids.editID);
            deleteTodo(todo, ids.listItemID, ids.deleteID);
        });
    }

    //This event listener is connected with the form from the html and adds a new box depending on what the user wrote on the input. It is connected to the POST request from app.js
    form.submit((e) => {
        e.preventDefault();
        fetch("/todos",{
            method : "post",
            body : JSON.stringify({todo : todoUserInput.val()}),
            headers : {
                "Content-Type" : "application/json; charset=utf-8"
            }
        }).then((response) => {
            return response.json();
        }).then((data) => {
            if(!data.error){
                if(data.result.ok == 1 && data.result.n == 1){
                    let ids = buildIDS(data.document);
                    display.append(buildTemplate(data.document,ids));
                    editTodo(data.document, ids.todoID, ids.editID);
                    deleteTodo(data.document, ids.listItemID, ids.deleteID);
                    displayMessage(true, data.msg);
                }
            }else{
                displayMessage(false, data.error.message);
            }
            resetTodosInput();
        });
    });

    //This funcs creates IDs that are going to be given to the html components in order tu avoid messing up with de todo._id
    const buildIDS = (todo) => {
        return {
            editID : "edit_" +todo._id,
            deleteID : "delete_" +todo._id,
            listItemID : "listItem_" +todo._id,
            todoID : "todo_" + todo._id
        }
    }

    //This func adds the html to the code with the respective todo._id and his buildsIDS
    const buildTemplate = (todo, ids) => {
        return `<li class="list-group-item" id="${ids.listItemID}">
                    <div class="row">
                        <div class="col-md-4" id="${ids.todoID}">${todo.todo}</div>
                        <div class="col-md-4"></div>
                        <div class="col-md-4 text-right">
                            <button type="button" class="btn btn-secondary" id="${ids.editID}">Edit</button>
                            <button type="button" class="btn btn-danger" id="${ids.deleteID}">Delete</button>
                        </div> 
                    </div>
                </li>`;
    }

    //This func edits the box related to the todo._id given with what the user has written in the input. It is connected to the PUT request from app.js
    const editTodo = (todo,todoID,editID) => {
        let editBtn = $(`#${editID}`);
        editBtn.click(() => {
            fetch(`/${todo._id}`,{
                method : "put",
                headers : {
                    "Content-Type" : "application/json; charset=utf-8"
                },
                body : JSON.stringify({todo : todoUserInput.val()})
            }).then((response) => {
                return response.json();
            }).then((data) => {
                if(!data.error){
                    if(data.ok == 1){
                        let todoIndex = $(`#${todoID}`);
                        todoIndex.html(data.value.todo);
                        displayMessage(true,data.msg);
                    }
                }else{
                    displayMessage(false,data.error.message);
                }
                resetTodosInput();
            });
        });
    }

    //This func remove the box related to the todo._id given. It is connected to the DELETE request from app.js
    const deleteTodo = (todo,listItemID, deleteID) => {
        let deleteBtn = $(`#${deleteID}`);
        deleteBtn.click(() => {
            fetch(`/${todo._id}`,{
                method: "delete"
            }).then((response) => {
                return response.json();
            }).then((data) => {
                if(data.ok == 1){
                    $(`#${listItemID}`).remove();
                }
            });
        });
    }

    //This function shows a green success box if input is correct or a red danger box if not
    const displayMessage = (flag,msg) => {
        if(flag){
            message.removeClass("alert-danger");
            message.addClass("alert-success");
            message.html(msg);
            message.show();
        }else{
            message.removeClass("alert-success");
            message.addClass("alert-danger");
            message.html(msg);
            message.show();
        }   
    }
});