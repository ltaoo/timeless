export interface TodoItem {
  id: number
  title: string
  category: string
  completed: boolean
}

@Entry
@Component
struct Index {
  @State private todos: TodoItem[] = [
    { id: 1, title: 'Buy milk', category: 'work', completed: false },
    { id: 2, title: 'Read docs', category: 'daily', completed: true }
  ]
  @State private draftTitle: string = ''
  @State private selectedCategory: string = 'work'
  @State private nextId: number = 3
  private categories: string[] = ['work', 'daily']

  private addTodo(): void {
    const title = this.draftTitle.trim()
    if (!title.length) {
      return
    }

    this.todos = [{ id: this.nextId, title, category: this.selectedCategory, completed: false }, ...this.todos]
    this.nextId = this.nextId + 1
    this.draftTitle = ''
  }

  private toggleTodo(id: number): void {
    this.todos = this.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
  }

  private removeTodo(id: number): void {
    this.todos = this.todos.filter((t) => t.id !== id)
  }

  private clearCompleted(): void {
    this.todos = this.todos.filter((t) => !t.completed)
  }

  private get completedCount(): number {
    return this.todos.reduce((acc, t) => acc + (t.completed ? 1 : 0), 0)
  }

  private get activeCount(): number {
    return this.todos.length - this.completedCount
  }

  build() {
    Column() {
      Text('Todo List')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 12 })

      Row() {
        Select(this.categories)
          .value(this.selectedCategory)
          .onSelect((index: number) => {
            this.selectedCategory = this.categories[index]
          })
          .width(100)
        
        TextInput({ placeholder: 'Add a todo', text: this.draftTitle })
          .layoutWeight(1)
          .margin({ left: 8 })
          .onChange((value) => {
            this.draftTitle = value
          })
          .onSubmit(() => {
            this.addTodo()
          })

        Button() {
          Image($r('app.media.start_icon'))
            .width(24)
            .height(24)
        }
        .margin({ left: 8 })
        .onClick(() => this.addTodo())
      }
      .margin({ bottom: 12 })

      Row() {
        Text(`${this.activeCount} active · ${this.completedCount} completed`)
          .fontSize(14)
          .fontColor('#666666')
          .layoutWeight(1)

        Button('Clear completed')
          .enabled(this.completedCount > 0)
          .onClick(() => this.clearCompleted())
      }
      .margin({ bottom: 12 })

      List() {
        ForEach(this.todos, (todo: TodoItem) => {
          ListItem() {
            Row() {
              Checkbox({ name: `${todo.id}`, group: 'todos' })
                .select(todo.completed)
                .onChange((checked) => {
                  if (checked !== todo.completed) {
                    this.toggleTodo(todo.id)
                  }
                })

              Text(todo.title)
                .fontSize(16)
                .margin({ left: 10 })
                .fontColor(todo.completed ? '#999999' : '#111111')
                .decoration({ type: todo.completed ? TextDecorationType.LineThrough : TextDecorationType.None })
                .layoutWeight(1)

              Text(`(${todo.category})`)
                .fontSize(14)
                .fontColor('#999999')
                .margin({ left: 8 })
                
              Button('Delete')
                .type(ButtonType.Normal)
                .onClick(() => this.removeTodo(todo.id))
            }
            .padding({ top: 10, bottom: 10 })
          }
        }, (todo: TodoItem) => `${todo.id}`)
      }
      .divider({ strokeWidth: 1, color: '#E6E6E6' })
      .edgeEffect(EdgeEffect.None)
      .layoutWeight(1)
    }
    .padding(16)
    .height('100%')
    .width('100%')
  }
}

