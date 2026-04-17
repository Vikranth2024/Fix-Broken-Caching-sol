const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const cacheService = require('./services/cache.service');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// GET /tasks (all)
app.get('/tasks', async (req, res) => {
  try {
    const cacheKey = cacheService.generateKey('tasks');
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      console.log('Serving list from cache');
      return res.status(200).json(cachedData);
    }

    const tasks = await prisma.task.findMany();
    // Cache the list
    cacheService.set(cacheKey, tasks);
    
    res.status(200).json(tasks);
  } catch (err) {
    console.error('Error fetching tasks', err);
    res.status(500).json({ error: 'Internal server error while fetching tasks' });
  }
});

// GET /tasks/:id
app.get('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = cacheService.generateKey('task', id);

  try {
    const cachedTask = cacheService.get(cacheKey);
    if (cachedTask) {
      console.log(`Serving task ${id} from cache`);
      return res.status(200).json(cachedTask);
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Cache specific task
    cacheService.set(cacheKey, task);
    res.status(200).json(task);

  } catch (err) {
    console.error('Error fetching task by ID', err);
    res.status(500).json({ error: 'Internal server error while fetching task' });
  }
});

// POST /tasks
app.post('/tasks', async (req, res) => {
  const { title, description, price } = req.body;
  if (!title || !description || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newTask = await prisma.task.create({
      data: { 
        title, 
        description, 
        price: parseFloat(price) 
      }
    });

    // CRITICAL: Invalidate the tasks list cache after creation
    cacheService.del(cacheService.generateKey('tasks'));

    // Fix status code to 201 for Created
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error creating task', err);
    res.status(500).json({ error: 'Internal server error while creating task' });
  }
});

// DELETE /tasks/:id
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    // CRITICAL FIX: Proper invalidation
    // 1. Delete the specific task cache
    cacheService.del(cacheService.generateKey('task', id));
    // 2. Delete the list cache
    cacheService.del(cacheService.generateKey('tasks'));

    // Fix status code to 204 for No Content/Deleted
    res.status(204).send();

  } catch (err) {
    // Check if task exists for better error reporting
    console.error('Error deleting task', err);
    res.status(500).json({ error: 'Internal server error while deleting task. Does the ID exist?' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Solution Server running on http://localhost:${PORT}`);
});
