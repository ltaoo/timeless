import SwiftUI

struct TodoItem: Identifiable {
    let id = UUID()
    var title: String
    var category: String
    var isCompleted: Bool
}

enum TodoCategory: String, CaseIterable {
    case work = "work"
    case daily = "daily"
}

struct ContentView: View {
    @State private var inputText = ""
    @State private var selectedCategory: TodoCategory = .work
    @State private var todos: [TodoItem] = []
    
    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Picker("Category", selection: $selectedCategory) {
                    ForEach(TodoCategory.allCases, id: \.self) { category in
                        Text(category.rawValue).tag(category)
                    }
                }
                .pickerStyle(.menu)
                .frame(width: 100)
                
                TextField("Enter todo", text: $inputText)
                    .textFieldStyle(.roundedBorder)
                
                Button {
                    addTodo()
                } label: {
                    Image(systemName: "plus.circle.fill")
                }
                .frame(width: 44)
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
                .onMove { source, destination in
                    todos.move(fromOffsets: source, toOffset: destination)
                }
            }
            .listStyle(.plain)
            .simultaneousGesture(TapGesture().modifiers(.command))
        }
    }
    
    private func addTodo() {
        guard !inputText.isEmpty else { return }
        todos.append(TodoItem(title: inputText, category: selectedCategory.rawValue, isCompleted: false))
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