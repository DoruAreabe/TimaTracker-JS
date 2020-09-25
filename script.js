const apiKey = '8537e803-ad84-4dd4-9df2-472deca90df6';
const apiHost = 'https://todo-api.coderslab.pl';
const addValue = document.querySelector(".js-task-adding-form");

addValue.addEventListener("submit", async (event) => {
    const title = addValue.querySelector("#title").value;
    const description = addValue.querySelector("#desc").value;
    event.preventDefault();
    await addTask(title, description)
    await renderPage();
    addValue.querySelector("#title").value="";
    addValue.querySelector("#desc").value="";
})

function apiListTasks() {
    return fetch(apiHost + '/api/tasks', {
        headers: {Authorization: apiKey}
    }).then((response) => {
        if (!response.ok) {
            alert('Server connection failed');
        }
        return response.json();
    })
}

function apiListTasksWithOperations(id) {
    return fetch(apiHost + '/api/tasks/' + id + '/operations', {
        headers: {Authorization: apiKey}
    }).then((response) => {
        if (!response.ok) {
            alert('Server connection failed');
        }
        return response.json()
    })
}

function createOpenTaskSection(element) {
    const sectionExample = document.getElementById("opened");
    const section = sectionExample.cloneNode(true);
    const formAdd =section.querySelector("#operationAdd");
    formAdd.addEventListener("submit", async (event)=>{
        event.preventDefault();
        const desc = formAdd.querySelector("input").value;
        await addOperationToTask(element.id,desc);
        await renderPage();
    })
    const delBtn = section.querySelector(".btn.btn-outline-danger.btn-sm.ml-2")
    delBtn.addEventListener("click", async (event) => {
            event.preventDefault();
            await deleteTask(element.id);
            await renderPage();
    });
    const updBtn = section.querySelector(".btn.btn-dark.btn-sm")
    updBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        await updateStatus(element.title, element.description, element.id)
        await renderPage();
    })
    const ul = section.querySelector("ul");
    ul.innerText = "";
    section.querySelector("h5").innerText = element.title;
    section.querySelector("h6").innerText = element.description;
    if (element.operations?.length) {
        for (const el of element.operations) {
            const li = createOpenLi(el);
            ul.appendChild(li);
        }
    }
    return section;
}

function createOpenLi(el) {
    const exampleLi = document.querySelector("#opened ul li");
    const li = exampleLi.cloneNode(true);
    const btn15 = li.querySelector("#btn15");
    btn15.addEventListener("click",async (event)=>{
        const updatedTime=el.timeSpent+15;
        await updateOperation(el.id,el.description,updatedTime);
        await renderPage();
    })
    const btn60 = li.querySelector("#btn60");
    btn60.addEventListener("click",async (event)=>{
        const updatedTime=el.timeSpent+60;
        await updateOperation(el.id,el.description,updatedTime);
        await renderPage();
    })
    const btnDeleteOperation = li.querySelector("#btnDeleteOperation");
    btnDeleteOperation.addEventListener("click",async (event)=>{
        event.preventDefault();
        await deleteOperation(el.id);
        await renderPage();
    })
    li.querySelector("div>div").innerText = el.description
    let time = el.timeSpent;
    let h = Math.floor(time / 60);
    let m = time % 60;
    li.querySelector("div>span").innerText = `${h}h ${m}m`;
    return li;
}

function createClosedTaskSection(element) {
    const sectionExample = document.getElementById("closed");
    const section = sectionExample.cloneNode(true);
    const delBtn = section.querySelector(".btn.btn-outline-danger.btn-sm.ml-2")
    delBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        await deleteTask(element.id);
        await renderPage();

    });
    const ul = section.querySelector("ul");
    ul.innerText = "";
    section.querySelector("h5").innerText = element.title;
    section.querySelector("h6").innerText = element.description;
    if (element.operations?.length) {
        for (const el of element.operations) {
            const li = createClosedLi(el);
            ul.appendChild(li);
        }

    }
    return section;
}

function createClosedLi(el) {
    const exampleLi = document.querySelector("#closed ul li");
    const li = exampleLi.cloneNode(true);
    console.log(li);
    li.querySelector("div>div").innerText = el.description
    let time = el.timeSpent;
    let h = Math.floor(time / 60);
    let m = time % 60;
    li.querySelector("div>span").innerText = `${h}h ${m}m`;
    return li;
}

async function renderPage() {
    const data = await apiListTasks();
    const dataSet = data.data;
    await Promise.all(dataSet.map(async el => {
        let op = (await apiListTasksWithOperations(el.id))
        el.operations = op.data;
    }))
    const placeToInput = document.getElementById("mainInput");
    placeToInput.innerText = ""
    for (const el of dataSet) {
        if (el.status === "open") {
            const section = createOpenTaskSection(el);
            placeToInput.appendChild(section)
        } else {
            const section = createClosedTaskSection(el);
            placeToInput.appendChild(section)
        }
    }
}

function addTask(title, desc) {
    console.log(title);
    console.log(desc);
    return fetch(apiHost + '/api/tasks',
        {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({title: title, description: desc, status: 'open'})
        }
    ).then((response) => {
        if (!response.ok) {
            alert('Server connection failed');
        }
        return response.json();
    })
}

function deleteTask(id) {
    return fetch(apiHost + '/api/tasks/' + id,
        {
            method: 'DELETE',
            headers: {
                'Authorization': apiKey
            }
        }
    ).then((response) => {
        if (!response.ok) {
            alert('Server connection failed');
        }
        return response.json();
    })
}

function updateStatus(title, desc, id) {
    return fetch(apiHost + '/api/tasks/' + id,
        {
            method: 'PUT',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({title: title, description: desc, status: 'closed'})
        }
    ).then((response) => {
        if (!response.ok) {
            alert('Server connection failed');
        }
        return response.json();
    })
}

function  addOperationToTask (id,desc){
    return fetch(apiHost + '/api/tasks/' + id + '/operations',
        {
            method: 'POST',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({description: desc, timeSpent: 0})
        }
    ).then((response) => {
        if (!response.ok) {
            alert('Server connection failed');
        }
        return response.json();
    })
}

function updateOperation (id,desc,time){
    return fetch(apiHost + '/api/operations/' + id,
        {
            method: 'PUT',
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({description: desc, timeSpent: time})
        }
    ).then((response) => {
        if (!response.ok) {
            alert('Server connection failed');
        }
        return response.json();
    })
}

function deleteOperation(id){
    return fetch(apiHost + '/api/operations/' + id,
        {
            method: 'DELETE',
            headers: {
                'Authorization': apiKey
            }
        }
    ).then((response) => {
        if (!response.ok) {
            alert('Server connection failed');
        }
        return response.json();
    })
}

document.addEventListener('DOMContentLoaded', renderPage);
