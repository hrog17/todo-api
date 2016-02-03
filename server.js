var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3001;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res){
  res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function (req, res){
  res.json(todos);
});

// GET /todos/id
app.get('/todos/:id', function (req,res) {
  var todoId = parseInt(req.params.id,10);
  // iterate over todos array to find the match
  var matchTodo = _.findWhere(todos, {id: todoId});

  if ( typeof matchTodo === 'undefined') {
    //res.json(todoObj);
    res.status(404).send();
  }
  else {
    console.log ('hit');
    //res.status(404).send();
    res.json(matchTodo);
  }
});

// POST /todos
app.post('/todos',function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
      return res.status(400).send();
    }

    body.description = body.description.trim();

    body.id = todoNextId++;
    //console.log('description: ' + body.description);
    todos.push(body);

    res.status(201).json (body);
});


app.listen(PORT, function() {
  console.log ('application is listening on port ' + PORT);
});
