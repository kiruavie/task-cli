const fs = require("fs");
const path = require("path");

const TASK_FILE = path.join(__dirname, "tasks.json");

// initialize the file if don't exists !

if (!fs.existsSync(TASK_FILE)) {
  fs.writeFileSync(TASK_FILE, JSON.stringify([]));
}

// utilities functions

function loadTasks() {
  const data = fs.readFileSync(TASK_FILE, "utf-8");
  return JSON.parse(data);
}

function saveTasks(tasks) {
  fs.writeFileSync(TASK_FILE, JSON.stringify(tasks, null, 4));
}

function generateId(tasks) {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map((task) => task.id)) + 1;
}

function findTask(tasks, id) {
  return tasks.find((task) => task.id === id);
}

// commandes

function addTask(description) {
  const tasks = loadTasks();
  const newTask = {
    id: generateId(tasks),
    description,
    status: "todo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveTasks(tasks);
  console.log(`Task added succesfully (ID: ${newTask.id})`);
}

function updateTask(id, newDescription) {
  const tasks = loadTasks();
  const task = findTask(tasks, id);

  if (task) {
    task.description = newDescription;
    task.updatedAt = new Date().toISOString();
    saveTasks(tasks);
    console.log("Task updated successfully");
  } else {
    console.log("Task not found.");
  }
}

function deleteTask(id) {
  const tasks = loadTasks();
  const newTasks = tasks.filter((task) => task.id !== id);
  if (newTasks.length === tasks.length) {
    console.log("Task not found");
  } else {
    saveTasks(newTasks);
    console.log("Task deleted successfully");
  }
}

function markTask(id, status) {
  const tasks = loadTasks();
  const task = findTask(tasks, id);
  if (task) {
    task.status = status;
    task.updatedAt = new Date().toISOString();
    saveTasks(tasks);
    console.log(`Task marked as ${status}.`);
  } else {
    console.log("Task not found");
  }
}

function listTasks(filterStatus) {
  const tasks = loadTasks();
  let filtered = tasks;
  if (filterStatus) {
    filtered = tasks.filter((task) => task.status === filterStatus);
  }

  if (filtered.length === 0) {
    console.log("No tasks found");
  } else {
    filtered.forEach((task) => {
      console.log(
        `[${task.id}] ${task.description} ${task.status} - Created at: ${task.createdAt} - updated at: ${task.updatedAt}`
      );
    });
  }
}

// Point d'entrée

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Please provide a command");
    return;
  }

  const command = args[0];

  switch (command) {
    case "add":
      if (args.length < 2) {
        console.log("Please provide a description");
        return;
      }
      addTask(args.slice(1).join(" "));
      break;

    case "update":
      if (args.length < 3) {
        console.log("Usage: update <id> <new_description>");
        return;
      }
      const updateId = parseInt(args[1]);
      if (isNaN(updateId)) {
        console.log("Invalid ID");
        return;
      }
      updateTask(updateId, args.slice(2).join(" "));
      break;

    case "delete":
      if (args.length < 2) {
        console.log("Usage: delete <id>");
        return;
      }
      const deleteId = parseInt(args[1]);
      if (isNaN(deleteId)) {
        console.log("Invalid ID");
        return;
      }
      deleteTask(deleteId);
      break;

    case "mark-in-progress":
      if (args.length < 2) {
        console.log(`Usage: mark-in-progress <id>`);
        return;
      }
      const progressId = parseInt(args[1]);
      if (isNaN(progressId)) {
        console.log("Invalid ID");
        return;
      }
      markTask(progressId, "in-progress");
      break;

    case "mark-done":
      if (args.length < 2) {
        console.log("Usage: mark-done <id>");
        return;
      }
      const doneId = parseInt(args[1]);
      if (isNaN(doneId)) {
        console.log("Invalid ID");
        return;
      }
      markTask(doneId, "done");
      break;

    case "list":
      const status = args[1]; // peut être 'done', 'todo', ou 'in-progress'
      if (status && !["todo", "done", "in-progress"].includes(status)) {
        console.log("Invalid status. Use 'todo', 'in-progress', or 'done'");
        return;
      }
      listTasks(status);
      break;

    case "help":
      console.log(`
Available commands:
  - add <description>
  - update <id> <new_description>
  - delete <id>
  - mark-in-progress <id>
  - mark-done <id>
  - list [todo|in-progress|done]
      `);
      break;

    default:
      console.log("Unknown command.");
  }
}

main();
