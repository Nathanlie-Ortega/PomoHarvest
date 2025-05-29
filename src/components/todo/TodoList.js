// src/components/todo/TodoList.js
import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import { useAuth } from '../../hooks/useAuth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const { currentUser } = useAuth();
  
  // Load todos from Firebase or localStorage
  useEffect(() => {
    const loadTodos = async () => {
      try {
        let loadedTodos = [];
        
        // Try to load from Firebase if user is logged in
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists() && userDoc.data().todos) {
            loadedTodos = userDoc.data().todos;
          }
        } else {
          // Otherwise load from localStorage
          const savedTodos = localStorage.getItem('todos');
          if (savedTodos) {
            loadedTodos = JSON.parse(savedTodos);
          }
        }
        
        setTodos(loadedTodos);
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    };
    
    loadTodos();
  }, [currentUser]);
  
  // Save todos to Firebase or localStorage
  const saveTodos = async (updatedTodos) => {
    try {
      if (currentUser) {
        // Save to Firebase
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          todos: updatedTodos
        });
      } else {
        // Save to localStorage
        localStorage.setItem('todos', JSON.stringify(updatedTodos));
      }
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };
  
  const addTodo = (todo) => {
    const isEditing = todos.some(t => t.id === todo.id);
    let updatedTodos;
    
    if (isEditing) {
      // Update existing todo
      updatedTodos = todos.map(t => t.id === todo.id ? todo : t);
    } else {
      // Add new todo
      updatedTodos = [...todos, todo];
    }
    
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    setShowForm(false);
    setEditingTodo(null);
  };
  
  const toggleTodo = (id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };
  
  const deleteTodo = (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };
  
  const editTodo = (todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };
  
  // Function to move todo up in the list
  const moveTodoUp = (index) => {
    if (index === 0) return; // Already at the top
    
    const updatedTodos = [...todos];
    const temp = updatedTodos[index];
    updatedTodos[index] = updatedTodos[index - 1];
    updatedTodos[index - 1] = temp;
    
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };
  
  // Function to move todo down in the list
  const moveTodoDown = (index) => {
    if (index === todos.length - 1) return; // Already at the bottom
    
    const updatedTodos = [...todos];
    const temp = updatedTodos[index];
    updatedTodos[index] = updatedTodos[index + 1];
    updatedTodos[index + 1] = temp;
    
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };
  
  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-display font-bold">To-Do's</h2>
        
        <button
          onClick={() => {
            setEditingTodo(null);
            setShowForm(true);
          }}
          className="btn-primary rounded-full p-2"
          aria-label="Add task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {todos.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="mb-4">No tasks added yet</p>
          <button
            onClick={() => {
              setEditingTodo(null);
              setShowForm(true);
            }}
            className="btn-outline text-sm"
          >
            Add your first task
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo, index) => (
            <li key={todo.id} className="relative group">
              {/* Reorder buttons - visible on hover */}
              <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {index > 0 && (
                  <button 
                    onClick={() => moveTodoUp(index)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Move up"
                    aria-label="Move task up"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                
                {index < todos.length - 1 && (
                  <button 
                    onClick={() => moveTodoDown(index)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Move down"
                    aria-label="Move task down"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              <TodoItem
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
              />
            </li>
          ))}
        </ul>
      )}
      
      {showForm && (
        <TodoForm
          onAdd={addTodo}
          onCancel={() => {
            setShowForm(false);
            setEditingTodo(null);
          }}
          editingTodo={editingTodo}
        />
      )}
    </div>
  );
};

export default TodoList;