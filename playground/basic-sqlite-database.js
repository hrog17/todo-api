var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});
// abstract the database details
sequelize.sync({
    //force: true
}).then(function() {
    console.log('Everything is synced');

    // fetch a todo item by id
    Todo.findById(3).then(function(todo) {
        if (todo) {
            console.log(todo.toJSON());
        } else {
            console.log('no todo found');
        }
    });


    // Todo.create({
    //     description: "Take out trash",
    //     completed: true
    // }).then(function(todo) {
    //     return Todo.create({
    //         description: 'clean office'
    //     });
    // }).then(function() {
    //     //return Todo.findById(1);
    //     return Todo.findAll({
    //         where: {
    //             description: {
    //                 // not case-sensitive
    //                 $like: '%Office%'
    //             }
    //         }
    //     })
    // }).then(function(todos) {
    //     if (todos) {
    //         todos.forEach(function(todo) {
    //             console.log(todo.toJSON());
    //         });
    //     } else {
    //         console.log('no todos found');
    //     }
    // }).catch(function(e) {
    //     console.log(e);
    // });
});
