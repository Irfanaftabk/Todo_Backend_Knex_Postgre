const request = require('supertest');
const express = require('express');
const todoRoutes = require('../../server-routes.js');
const todoQueries = require('../../database/todo-queries');

const app = express();
app.use(express.json());
app.use('/todos', todoRoutes);

jest.mock('../../database/todo-queries');

describe('Todo Routes API', () => {
    // GET all todos
    it('should return all todos', async () => {
        const mockTodos = [{ id: 1, title: 'Test Todo', completed: false, order: 1 }];
        todoQueries.getALLTodos.mockResolvedValue(mockTodos);

        const res = await request(app).get('/todos');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockTodos);
    });

    // GET single todo
    it('should return a single todo by ID', async () => {
        const mockTodo = { id: 1, title: 'Test Todo', completed: false, order: 1 };
        todoQueries.getTodoById.mockResolvedValue(mockTodo);

        const res = await request(app).get('/todos/1');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockTodo);
    });

    it('should return 404 if todo not found', async () => {
        todoQueries.getTodoById.mockResolvedValue(null);
        
        const res = await request(app).get('/todos/99');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Todo not found' });
    });

    // POST single todo
    it('should create a new todo', async () => {
        const newTodo = { title: 'New Todo', completed: false, order: 1 };
        const createdTodo = { id: 1, ...newTodo };
        todoQueries.createTodo.mockResolvedValue(createdTodo);

        const res = await request(app).post('/todos').send(newTodo);

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ success: true, meessage: 'Todo created successfully', data: createdTodo });
    });

    // POST multiple todos
    it('should create multiple todos', async () => {
        const newTodos = [
            { title: 'Todo 1', completed: false, order: 1 },
            { title: 'Todo 2', completed: true, order: 2 }
        ];
        todoQueries.createTodos.mockResolvedValue(newTodos);

        const res = await request(app).post('/todos').send(newTodos);

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ message: `Successfully create ${newTodos.length} todos`, data: newTodos, success: true });
    });

    // PUT update todo
    it('should update an existing todo', async () => {
        const updatedTodo = { id: 1, title: 'Updated Todo', completed: true, order: 1 };
        todoQueries.updateTodo.mockResolvedValue(updatedTodo);

        const res = await request(app).put('/todos/1').send(updatedTodo);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true, message: 'Todo updated successfully', data: updatedTodo });
    });

    it('should return 400 if required fields are missing in update', async () => {
        const res = await request(app).put('/todos/1').send({});
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ success: false, error: 'Missing required fields' });
    });

    it('should return 404 if todo to update is not found', async () => {
        todoQueries.updateTodo.mockResolvedValue(null);
        const res = await request(app).put('/todos/99').send({ id: 99, title: 'Test', completed: false, order: 1 });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Todo not found' });
    });

    // DELETE single todo
    it('should delete a single todo', async () => {
        todoQueries.deleteTodo.mockResolvedValue(true);

        const res = await request(app).delete('/todos/1');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true, message: 'Todo deleted Successfully' });
    });

    it('should return 404 if todo to delete is not found', async () => {
        todoQueries.deleteTodo.mockResolvedValue(false);
        
        const res = await request(app).delete('/todos/99');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ success: false, message: 'Todo not found' });
    });

    // DELETE all todos
    it('should delete all todos', async () => {
        todoQueries.deleteAllTodos.mockResolvedValue(10);

        const res = await request(app).delete('/todos');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true, message: 'Successfully deleted all todos10items' });
    });
});
