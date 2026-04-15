import 'package:flutter/material.dart';

void main() {
  runApp(const TodoApp());
}

class TodoApp extends StatelessWidget {
  const TodoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: TodoScreen(),
    );
  }
}

class TodoScreen extends StatefulWidget {
  const TodoScreen({super.key});

  @override
  State<TodoScreen> createState() => _TodoScreenState();
}

class _TodoScreenState extends State<TodoScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<TodoItem> _todos = [];
  String _selectedCategory = 'work';

  static const List<String> _categories = ['work', 'daily'];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _addTodo() {
    final title = _controller.text;
    if (title.isEmpty) return;
    setState(() {
      _todos.add(TodoItem(title: title, category: _selectedCategory, isCompleted: false));
    });
    _controller.clear();
  }

  void _toggleTodo(int index) {
    setState(() {
      _todos[index] =
          _todos[index].copyWith(isCompleted: !_todos[index].isCompleted);
    });
  }

  void _archiveTodo(int index) {
    setState(() {
      _todos.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Todo')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                DropdownButton<String>(
                  value: _selectedCategory,
                  items: _categories.map((category) {
                    return DropdownMenuItem(
                      value: category,
                      child: Text(category),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedCategory = value!;
                    });
                  },
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: 'Enter todo',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _addTodo,
                  child: const Icon(Icons.add_circle),
                ),
              ],
            ),
          ),
          Expanded(
            child: ReorderableListView.builder(
              itemCount: _todos.length,
              onReorder: (oldIndex, newIndex) {
                setState(() {
                  if (newIndex > oldIndex) newIndex -= 1;
                  final item = _todos.removeAt(oldIndex);
                  _todos.insert(newIndex, item);
                });
              },
              itemBuilder: (context, index) {
                final todo = _todos[index];
                return ListTile(
                  key: ValueKey(todo),
                  leading: Checkbox(
                    value: todo.isCompleted,
                    onChanged: (_) => _toggleTodo(index),
                  ),
                  title: Text(
                    todo.title,
                    style: TextStyle(
                      decoration:
                          todo.isCompleted ? TextDecoration.lineThrough : null,
                      color: todo.isCompleted ? Colors.grey : Colors.black,
                    ),
                  ),
                  trailing: todo.isCompleted
                      ? TextButton(
                          onPressed: () => _archiveTodo(index),
                          child: const Text('Archive'),
                        )
                      : ReorderableDragStartListener(
                          index: index,
                          child: const Icon(Icons.drag_handle),
                        ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class TodoItem {
  final String title;
  final String category;
  final bool isCompleted;

  TodoItem({required this.title, required this.category, required this.isCompleted});

  TodoItem copyWith({String? title, String? category, bool? isCompleted}) {
    return TodoItem(
      title: title ?? this.title,
      category: category ?? this.category,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }
}
