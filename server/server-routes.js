const express = require('express');
const router = express.Router();
const todoQueries = require('./database/todo-queries.js');

//Get all todos
router.get('/',async(req, res) => {
  try{
    const todos = await todoQueries.getALLTodos();
    res.json(todos);
  }
  catch(error){
    console.error('Error fetching todos', error)
  }
})
//get single todo
router.get('/:id',async(req, res) => {
  try{
    const todo = await todoQueries.getTodoById(req.params.id);
    if(!todo){
      return res.status(404).json({error:'Todo not found'});
    }
    res.json(todo);
  }
  catch(error){
    console.error('Error fetching todos', error)
  }
})
//Post single and multiple todos
router.post('/',async(req, res) => {
  try{
    if(Array.isArray(req.body)){
      const todos = await todoQueries.createTodos(req.body);
      res.status(201).json({
        message:`Successfully create ${todos.length} todos`,
        data:todos,
        success:true
      })
    }
    else{
      const todo = await todoQueries.createTodo(req.body);
      res.status(201).json({
        success:true,
        meessage: 'Todo created successfully',
        data:todo
      })
    }
  }
  catch(error){
    console.error("Error creating todos", error);
  }
})
//PUT Method
router.put('/:id',async(req, res) => {
  try{
    if(!req.body.title || req.body.completed === undefined || req.body.order === undefined){
      return res.status(400).json({
        success:false,
        error: 'Missing required fields'
      })
    }
    const updated = await todoQueries.updateTodo(req.params.id, {id: req.body.id, 
      title : req.body.title,
      completed: req.body.completed,
      order: req.body.order
    });
    if(!updated){
      return res.status(404).json({error:'Todo not found'});
    }
    res.json({
      success:true,
      message:'Todo updated successfully',
      data:updated
    });
  }
  catch(error){
    console.error('Error updating todos', error);
  }
})
// Delete all todos method
router.delete('/', async (req,res) =>{
  try{
    const count = await todoQueries.deleteAllTodos();
    res.status(200).json({
      success:true,
      message:"Successfully deleted all todos"+ count + "items",
    })
  }
  catch(error){
    console.error("error in deleting todos");
  }
})

//Delete single todo
router.delete('/:id', async (req,res)=> {
try{
const deleted = await todoQueries.deleteTodo(req.params.id);
if(!deleted){
  return(res.status(404).json({
    success:false,
    message:"Todo not found"
  }))
}
  res.status(200).json({
    success:true,
    message:"Todo deleted Successfully"
  })
}
catch(error){
  console.error("Some error in deleting todo , Internal Server Error");
}
})

module.exports = router;