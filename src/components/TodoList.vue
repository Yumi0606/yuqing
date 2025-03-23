<template>
  <div :class="['todo-list', { 'dark-mode': isDarkMode }]">
    <h1>待办事项</h1>
    <div class="input-group">
      <input 
        v-model="newTodo" 
        @keyup.enter="addTodo" 
        placeholder="添加新的待办事项"
        type="text"
        aria-label="新待办事项"
      />
      <button @click="addTodo" title="添加待办事项">
        <i class="fas fa-plus"></i> 添加
      </button>
    </div>
    <transition-group name="list" tag="ul">
      <li v-for="(todo, index) in filteredTodos" :key="todo.id" :class="{ completed: todo.completed }">
        <input 
          type="checkbox" 
          v-model="todo.completed" 
          @change="saveTodos"
          :aria-label="'完成' + todo.text"
        />
        <span @dblclick="editTodo(todo)">{{ todo.text }}</span>
        <button @click="removeTodo(index)" title="删除待办事项">
          <i class="fas fa-trash"></i> 删除
        </button>
      </li>
    </transition-group>
    <div class="filters">
      <button @click="filter = 'all'" title="显示全部待办事项">
        <i class="fas fa-list"></i> 全部
      </button>
      <button @click="filter = 'completed'" title="显示已完成待办事项">
        <i class="fas fa-check"></i> 已完成
      </button>
      <button @click="filter = 'active'" title="显示未完成待办事项">
        <i class="fas fa-times"></i> 未完成
      </button>
    </div>
    <p>完成度：{{ completedPercentage }}%</p>
    <button @click="toggleDarkMode" class="toggle-mode" title="切换显示模式">
      <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i> 
      切换到{{ isDarkMode ? '亮色模式' : '夜间模式' }}
    </button>
    <button @click="clearCompleted" class="clear-completed" title="清除已完成的待办事项">
      清除已完成
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newTodo: '',
      todos: JSON.parse(localStorage.getItem('todos')) || [],
      filter: 'all',
      isDarkMode: false
    };
  },
  computed: {
    filteredTodos() {
      if (this.filter === 'completed') {
        return this.todos.filter(todo => todo.completed);
      } else if (this.filter === 'active') {
        return this.todos.filter(todo => !todo.completed);
      }
      return this.todos;
    },
    completedPercentage() {
      const completed = this.todos.filter(todo => todo.completed).length;
      return this.todos.length ? Math.round((completed / this.todos.length) * 100) : 0;
    }
  },
  methods: {
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push({ id: Date.now(), text: this.newTodo, completed: false });
        this.newTodo = '';
        this.saveTodos();
      }
    },
    removeTodo(index) {
      this.todos.splice(index, 1);
      this.saveTodos();
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
    },
    saveTodos() {
      localStorage.setItem('todos', JSON.stringify(this.todos));
    },
    editTodo(todo) {
      const newText = prompt('编辑待办事项', todo.text);
      if (newText !== null) {
        todo.text = newText;
        this.saveTodos();
      }
    },
    clearCompleted() {
      this.todos = this.todos.filter(todo => !todo.completed);
      this.saveTodos();
    }
  }
};
</script>

<style scoped>
.todo-list {
  --gradient-light: linear-gradient(120deg, #e0f7fa 0%, #f5f7fa 100%);
  --gradient-dark: linear-gradient(120deg, #2c3e50 0%, #3d566e 100%);
  --text-color-light: #2c3e50;
  --text-color-dark: #f9f9f9;
  --button-primary: #4CAF50;
  --button-danger: #e74c3c;
  --button-info: #3498db;
  --button-warning: #f39c12;

  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--gradient-light);
  color: var(--text-color-light);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dark-mode {
  background: var(--gradient-dark);
  color: var(--text-color-dark);
}

.input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

input[type="text"] {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input[type="text"]:focus {
  border-color: var(--button-primary);
  outline: none;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background-color: var(--button-primary);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  gap: 0.5rem;
  min-height: 40px;
}

button i {
  font-size: 1rem;
  display: inline-block;
  width: 1em;
  height: 1em;
  line-height: 1;
}

button i + span {
  margin-left: 0.5rem;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  opacity: 0.9;
}

button:active {
  transform: translateY(0);
}

.filters button {
  background-color: var(--button-info);
  min-width: 100px;
  padding: 8px 16px;
}

.toggle-mode {
  background-color: var(--button-warning);
  margin: 1rem auto;
  display: block;
  width: auto;
  min-width: 150px;
}

.clear-completed {
  background-color: var(--button-danger);
  margin: 1rem auto;
  display: block;
  width: auto;
  min-width: 150px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
}

li {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  gap: 1rem;
  transition: all 0.3s ease;
}

.dark-mode li {
  background: rgba(0, 0, 0, 0.2);
}

li.completed span {
  text-decoration: line-through;
  color: #999;
}

li button {
  background-color: var(--button-danger);
  padding: 8px 16px;
  margin-left: auto;
  min-width: auto;
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.list-enter-active, .list-leave-active {
  transition: all 0.5s;
}

.list-enter, .list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

h1 {
  color: inherit;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
}

.completed-percentage {
  margin: 1rem 0;
  font-size: 1.1rem;
  color: inherit;
  text-align: center;
}
</style> 