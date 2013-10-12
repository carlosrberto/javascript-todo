var TodoApp = function() {
	this.todoList = [];
	this.render();
	this.renderSavedTodos();
}

TodoApp.prototype = {
	render: function() {
		// container
		this.container = document.createElement('div');
		this.container.id = 'todo-app';

		// title
		this.appTitle = document.createElement('h1');
		this.appTitle.appendChild(document.createTextNode('Todo List'));

		// todo input
		this.input = document.createElement('input');
		this.input.setAttribute('type', 'text');
		this.input.setAttribute('placeholder', 'Digite uma tarefa');

		// list element
		this.list = document.createElement('ul');
		this.list.classList.add('todo-list');

		this.container.appendChild(this.appTitle);
		this.container.appendChild(this.input);
		this.container.appendChild(this.list);

		document.body.appendChild(this.container);

		this.initEvents();
	},

	initEvents: function() {
		var that = this;
		this.input.addEventListener('keyup', function(event){
			if ( event.keyCode === 13 ) {
				that.createTodo(that.input.value, false);
				that.input.value = '';
			}
		});
	},

	renderSavedTodos: function() {
		var that = this;
		var todoList = localStorage.getItem('todoList');
		if ( todoList ) {
			todoList = JSON.parse(todoList);
			todoList.forEach(function(todo){
				that.createTodo(todo.text, todo.done);
			});
		}
	},

	createTodo: function(text, done) {
		var that = this;
		var todoItem = new TodoItem(text, done);
		var li = todoItem.render();
		this.list.appendChild(li);

		setTimeout(function() {
			li.classList.add('show');
		}, 50);
		
		this.todoList.push(todoItem);

		this.save();

		todoItem.listen('removed', function(){
			that.todoList.splice(that.todoList.indexOf(todoItem), 1);
			that.save();
		});

		todoItem.listen('done', function(){
			that.save();
		});

		todoItem.listen('contentedited', function(){
			that.save();
		});
	},

	save: function(todoItem) {
		// localStorage
		var todoArr = [];
		this.todoList.forEach(function(todo) {
			todoArr.push({ text: todo.text, done: todo.done });
		});
		localStorage.setItem('todoList', JSON.stringify(todoArr));
	}
}

var TodoItem = function(text, done) {
	this.text = text;
	this.done = done;
	this.notifications = [];
}

TodoItem.prototype = {
	listen: function(event, fn) {
		this.notifications.push({ event: event, fn: fn });
	},

	notify: function(event) {
		var that = this;
		this.notifications.forEach(function(item){
			if ( item.event === event ) {
				item.fn.call(that);
			}
		})	
	},

	render: function() {
		this.li = document.createElement('li');

		this.buttonDone = document.createElement('button');
		this.buttonDone.setAttribute('type', 'button');
		this.buttonDone.classList.add('done');
		this.buttonDone.appendChild(document.createTextNode(this.done ? 'undo' : 'done'));

		this.buttonRemove = document.createElement('button');
		this.buttonRemove.setAttribute('type', 'button');
		this.buttonRemove.classList.add('remove');
		this.buttonRemove.appendChild(document.createTextNode('remove'));

		this.todoText = document.createElement('span');
		this.todoText.classList.add('text');
		this.todoText.contentEditable = true;
		this.todoText.appendChild(document.createTextNode(this.text));

		this.li.appendChild(this.buttonDone);
		this.li.appendChild(this.buttonRemove);
		this.li.appendChild(this.todoText);

		if ( this.done ) {
			this.li.classList.add('todo-done');
		}

		this.initEvents();

		return this.li;
	},

	initEvents: function() {
		var that = this;

		// remove todo
		this.buttonRemove.addEventListener('click', function(){
			that.remove();
		});

		// mark as done
		this.buttonDone.addEventListener('click', function(){
			if ( that.done ) {
				that.markAsUnDone();
			} else {
				that.markAsDone();
			}
		});

		// content edited
		this.todoText.addEventListener('keyup', function() {
			that.text =  that.todoText.textContent;
			that.notify('contentedited');
		});
	},

	markAsUnDone: function() {
		this.li.classList.remove('todo-done');
		this.done = false;
		this.buttonDone.innerHTML = 'done';
		this.notify('done');
	},

	markAsDone: function() {
		this.li.classList.add('todo-done');
		this.done = true;
		this.buttonDone.innerHTML = 'undo';
		this.notify('done');
	},

	remove: function() {
		this.li.parentNode.removeChild(this.li);
		this.notify('removed');
	}
}

var todoApp = new TodoApp();