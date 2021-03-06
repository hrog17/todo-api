var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var _ = require('underscore');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);


var app = express();
var PORT = process.env.PORT || 3001;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Todo API Root');
});

// GET /todos?completed=false&q=work
app.get('/todos', middleware.requireAuthentication, function(req, res) {
    var queryParams = req.query;
    var where = {
        userId: req.user.get('id')
    };

    if (queryParams.hasOwnProperty('completed') && queryParams.completed ===
        'true') {
        where.completed = true;
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed ===
        'false') {
        where.completed = false;
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length >
        0) {
        where.description = {
            $like: '%' + queryParams.q + '%'
        };
    }

    db.todo.findAll({
        where: where
    }).then(function(todos) {
        res.json(todos);
    }).catch(function(e) {
        res.status(500).send();
    });
});

// var filteredTodos = todos;
//
// // if has property and completed == true
// // call .where(filteredTodos,?)
//
// if (queryParams.hasOwnProperty('completed') && queryParams.completed ===
//     'true') {
//     filteredTodos = _.where(filteredTodos, {
//         completed: true
//     });
// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed ===
//     'false') {
//     filteredTodos = _.where(filteredTodos, {
//         completed: false
//     });
// }
//
// if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length >
//     0) {
//     filteredTodos = _.filter(filteredTodos, function(todo) {
//         return todo.description.toLowerCase().indexOf(
//                 queryParams.q.toLowerCase()) >
//             -1;
//     });
// }
//
// res.json(filteredTodos);


// GET /todos/id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    // where userid and find(1)
    var where = {
        userId: req.user.get('id'),
        id: todoId
    };

    db.todo.findOne({
        where: where
    }).then(function(todo) {
        if (!!todo) {
            return res.json(todo.toJSON());
        } else {
            return res.status(404).json('todo id (' + todoId +
                ') found');
        }
    }).catch(function(e) {
        res.status(500).send();
    });

});

// POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    // call create on db.todoObj
    // .respond with 200 and the value of the todo object
    // else e - pass to res.status(400).json(e) - 400

    db.todo.create(body).then(function(todo) {

        req.user.addTodo(todo).then(function() {
            return todo.reload();
        }).then(function(todo) {
            return res.json(todo.toJSON());
        });

    }).catch(function(e) {
        return res.status(500).send;
    });

});

// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    // pull user id off the request object and match it
    var where = {
        userId: req.user.get('id'),
        id: todoId
    };

    db.todo.destroy({
        where: where
    }).then(function(affectedRows) {
        if (affectedRows === 0) {
            res.status(404).send();
        } else {
            res.status(204).send();
        }
    }, function(e) {
        return res.status(500).send();
    });

});

// Update - PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }


    // find(1) and user id...
    var where = {
        userId: req.user.get('id'),
        id: todoId
    };

    db.todo.findOne({
        where: where
    }).then(function(todo) {
        if (todo) {
            todo.update(attributes).then(function(todo) {
                res.json(todo.toJSON());
            }, function(e) {
                res.status(400).send();
            });
        } else {
            res.status(404).send();
        }
    }, function() {
        return res.status(500).send();
    });
});

// /users resource
app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function(user) {
        return res.json(user.toPublicJSON());
    }, function(e) {
        return res.status(400).json(e);
    });


});

// POST /users/login
app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function(user) {
        var token = user.generateToken('authentication');
        userInstance = user;

        return db.token.create({
            token: token
        });

    }).then(function(tokenInstance) {
        res.header('Auth', tokenInstance.get('token')).json(
            userInstance.toPublicJSON());
    }).catch(function() {
        res.status(401).send();
    });
});

// DELETE /users/login
app.delete('/users/login', middleware.requireAuthentication, function(req, res) {
    req.token.destroy().then(function() {
        res.status(204).send();
    }).catch(function() {
        res.status(500).send();
    });
});


db.sequelize.sync({
    force: true
}).then(function() {
    app.listen(PORT, function() {
        console.log('application is listening on port ' +
            PORT);
    });
});
