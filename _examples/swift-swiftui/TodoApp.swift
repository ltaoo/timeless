import SwiftUI

struct TodoItem: Identifiable {
    let id = UUID()
    var title: String
    var isCompleted: Bool
}

struct ContentView: View {
    @State private var inputText = ""
    @State private var todos: [TodoItem] = []
    
    var body: some View {
        VStack(spacing: 16) {
            HStack {
                TextField("Enter todo", text: $inputText)
                    .textFieldStyle(.roundedBorder)
                
                Button("Add") {
                    addTodo()
                }
                .frame(width: 60)
            }
            .padding(.horizontal)
            
            List {
                ForEach(todos) { todo in
                    HStack {
                        Toggle("", isOn: Binding(
                            get: { todo.isCompleted },
                            set: { updateTodo(id: todo.id, isCompleted: $0) }
                        ))
                        .labelsHidden()
                        
                        Text(todo.title)
                            .strikethrough(todo.isCompleted)
                            .foregroundColor(todo.isCompleted ? .gray : .black)
                        
                        Spacer()
                        
                        if todo.isCompleted {
                            Button("Archive") {
                                archiveTodo(id: todo.id)
                            }
                            .buttonStyle(.bordered)
                        }
                    }
                }
            }
            .listStyle(.plain)
        }
    }
    
    private func addTodo() {
        guard !inputText.isEmpty else { return }
        todos.append(TodoItem(title: inputText, isCompleted: false))
        inputText = ""
    }
    
    private func updateTodo(id: UUID, isCompleted: Bool) {
        if let index = todos.firstIndex(where: { $0.id == id }) {
            todos[index].isCompleted = isCompleted
        }
    }
    
    private func archiveTodo(id: UUID) {
        todos.removeAll { $0.id == id }
    }
}

#Preview {
    ContentView()
}