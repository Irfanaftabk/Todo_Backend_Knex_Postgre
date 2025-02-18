const db = require('./connection');

module.exports ={
//Get all todos
getALLTodos : () => {
    return db('todos').select('*').orderBy('order');
},
//Get single todo
getTodoById: (id) =>{
return db('todos').where({id}).first();
},
//Insert a new todo
createTodo : () => {
   return db('todos').insert(todo).returning('*');    
},
//Update a todo
updateTodo : (id, todo) => {
    return db('todos').where({id:Number(id)}).update(todo).returning('*');
},
//Create multiple Todos
createTodos : (todos) =>{
    return db('todos').insert(todos).returning('*');
},

deleteTodo:(id) => {
        return db('todos').where({id}).del();
    },

deleteAllTodos : async () => {
 const count = await db('todos').count('id').first();
 await db('todos').truncate();
 return count;
}
}