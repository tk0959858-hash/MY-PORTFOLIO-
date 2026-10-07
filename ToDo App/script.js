var taskInp = document.getElementById("addTaskInp");
var addBtn = document.getElementById("addBtn");
var taskList = document.getElementById("taskList");
var totalCount = document.getElementById("totalCount");
var completedCount = document.getElementById("completedCount");
var pendingCount = document.getElementById("pendingCount");

var editTask = null;

function updateCounters() {
    var total = taskList.children.length;
    var completed = taskList.querySelectorAll('input[type = "checkbox"]:checked').length;
    var pending = total - completed;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}

function createTask(text, isCompleted = false) {
    var taskdiv = document.createElement("div");
    taskdiv.className = "task";

    var inputcheckDiv = document.createElement("div")
    inputcheckDiv.className = "inputcheckBox";

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isCompleted; // load hote waqt tick rahe

    var span = document.createElement("span");
    span.textContent = text;
    if (isCompleted) span.classList.add("completed");

    checkbox.addEventListener("change", () => {
        if (checkbox.checked) span.classList.add("completed")
        else span.classList.remove("completed")
        updateCounters();
        saveTasks(); // <-- yahan save
    });

    var iconDiv = document.createElement("div");
    iconDiv.className = "iconsBox";

    var editicon = document.createElement("i");
    editicon.classList.add("fa-solid", "fa-pencil")
    editicon.addEventListener("click", () => {
        taskInp.value = span.textContent;
        editTask = span;
        addBtn.textContent = "Update";
        taskInp.focus();
    });

    var deleteicon = document.createElement("i");
    deleteicon.classList.add("fa-regular", "fa-trash-can")
    deleteicon.addEventListener("click", () => {
        taskdiv.remove();
        updateCounters();
        saveTasks(); // <-- yahan save
    })

    inputcheckDiv.appendChild(checkbox);
    inputcheckDiv.appendChild(span);
    taskdiv.appendChild(inputcheckDiv);
    iconDiv.appendChild(editicon);
    iconDiv.appendChild(deleteicon);
    taskdiv.appendChild(iconDiv);
    taskList.appendChild(taskdiv);

    taskInp.focus();
}

addBtn.addEventListener
    ("click", () => {
        var input = taskInp.value.trim();
        if (input === "") {
            taskInp.setCustomValidity("Please Enter something");
            taskInp.reportValidity();
            taskInp.focus();
            return;
        }
        taskInp.setCustomValidity("");

        if (editTask !== null) {
            editTask.textContent = input;
            editTask = null;
            taskInp.value = "";
            addBtn.textContent = "Add";
            return;
        } else {
            createTask(input);
        }

        taskInp.value = "";
        updateCounters();
        saveTasks();
    });

window.addEventListener("load", () => {
    loadTasks();
    updateCounters();
});

taskInp.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addBtn.click();
})

// 3 buttons pe click ka event
allBtn.addEventListener("click", () => filterTasks("all"));
activeBtn.addEventListener("click", () => filterTasks("active"));
completeBtn.addEventListener("click", () => filterTasks("completed"));

function filterTasks(type) {
    var tasks = taskList.children;
    for (var task of tasks) {
        var checkbox = task.querySelector('input[type="checkbox"]');

        if (type === "active") {
            task.style.display = checkbox.checked ? "none" : "flex";
        }
        else if (type === "completed") {
            task.style.display = checkbox.checked ? "flex" : "none";
        }
        else {
            task.style.display = "flex";
        }
    }
}


function saveTasks() {
    var tasks = [];
    for (var task of taskList.children) {
        var text = task.querySelector('span').textContent;
        var isChecked = task.querySelector('input[type="checkbox"]').checked;
        tasks.push({ text: text, completed: isChecked });
    }
    localStorage.setItem("myTasks", JSON.stringify(tasks));
}

function loadTasks() {
    var saved = localStorage.getItem("myTasks");
    if (saved) {
        var tasks = JSON.parse(saved);
        tasks.forEach(t => createTask(t.text, t.completed));
    }
}
