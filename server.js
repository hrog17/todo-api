var express = require('express');
var app = express();
var PORT = process.env.PORT || 3001;

var todos = [{
  id: 1,
  description: 'Take kids to kungfu.',
  completed: false
},{
  id: 2,
  description: 'Go to Market.',
  completed: false
},{
  id: 3,
  description: 'Have some snacks.',
  completed: true
}];


app.get('/', function (req, res){
  res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function (req, res){
  res.json(todos);
});

app.get('/todos/:id', function (req,res) {
  var todoId = parseInt(req.params.id,10);
  // iterate over todos array to find the match
  var todoObj;

  todos.forEach(function(todo) {
    if (todo.id === todoId) {
       todoObj = todo;
    }
  });

  if ( typeof todoObj === 'undefined') {
    //res.json(todoObj);
    res.status(404).send();
  }
  else {
    console.log ('hit');
    //res.status(404).send();
    res.json(todoObj);
  }
});


app.listen(PORT, function() {
  console.log ('application is listening on port ' + PORT);
});
