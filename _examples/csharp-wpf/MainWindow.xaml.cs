using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;

namespace TodoApp;

public class TodoItem : INotifyPropertyChanged
{
    private string _title = string.Empty;
    public string Title
    {
        get => _title;
        set { _title = value; OnPropertyChanged(); }
    }

    private string _category = "work";
    public string Category
    {
        get => _category;
        set { _category = value; OnPropertyChanged(); }
    }

    private bool _isCompleted;
    public bool IsCompleted
    {
        get => _isCompleted;
        set { _isCompleted = value; OnPropertyChanged(); }
    }

    public int Index { get; set; }

    public event PropertyChangedEventHandler? PropertyChanged;
    protected void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}

public partial class MainWindow : Window
{
    private List<TodoItem> _todos = new();
    private Point _dragStartPoint;
    private bool _isDragging;

    public MainWindow()
    {
        InitializeComponent();
        TodoListBox.ItemsSource = _todos;
        AddButton.Click += (s, e) => AddTodo();
        InputTextBox.KeyDown += (s, e) => { if (e.Key == Key.Enter) AddTodo(); };
        
        TodoListBox.PreviewMouseLeftButtonDown += TodoListBox_PreviewMouseLeftButtonDown;
        TodoListBox.PreviewMouseMove += TodoListBox_PreviewMouseMove;
        TodoListBox.Drop += TodoListBox_Drop;
        TodoListBox.AllowDrop = true;
    }

    private void TodoListBox_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        _dragStartPoint = e.GetPosition(null);
    }

    private void TodoListBox_PreviewMouseMove(object sender, MouseEventArgs e)
    {
        if (e.LeftButton == MouseButtonState.Pressed && !_isDragging)
        {
            Point position = e.GetPosition(null);
            if (Math.Abs(position.X - _dragStartPoint.X) > SystemParameters.MinimumHorizontalDragDistance ||
                Math.Abs(position.Y - _dragStartPoint.Y) > SystemParameters.MinimumVerticalDragDistance)
            {
                var listBox = sender as ListBox;
                var listBoxItem = FindAncestor<ListBoxItem>((DependencyObject)e.OriginalSource);
                
                if (listBoxItem != null && listBox != null)
                {
                    var todo = listBoxItem.DataContext as TodoItem;
                    if (todo != null && !todo.IsCompleted)
                    {
                        _isDragging = true;
                        var data = new DataObject("TodoItem", todo);
                        DragDrop.DoDragDrop(listBoxItem, data, DragDropEffects.Move);
                        _isDragging = false;
                    }
                }
            }
        }
    }

    private void TodoListBox_Drop(object sender, DragEventArgs e)
    {
        if (e.Data.GetDataPresent("TodoItem"))
        {
            var draggedItem = e.Data.GetData("TodoItem") as TodoItem;
            var listBox = sender as ListBox;
            var targetItem = FindAncestor<ListBoxItem>((DependencyObject)e.OriginalSource);
            
            if (listBox != null && targetItem != null && draggedItem != null)
            {
                var targetTodo = targetItem.DataContext as TodoItem;
                if (targetTodo != null && !targetTodo.IsCompleted && draggedItem.IsCompleted == false)
                {
                    var fromIndex = draggedItem.Index;
                    var toIndex = targetTodo.Index;
                    
                    if (fromIndex != toIndex)
                    {
                        _todos.Remove(draggedItem);
                        _todos.Insert(toIndex, draggedItem);
                        
                        for (int i = 0; i < _todos.Count; i++)
                        {
                            _todos[i].Index = i;
                        }
                        
                        TodoListBox.Items.Refresh();
                    }
                }
            }
        }
        e.Handled = true;
    }

    private static T? FindAncestor<T>(DependencyObject current) where T : DependencyObject
    {
        while (current != null)
        {
            if (current is T t)
                return t;
            current = VisualTreeHelper.GetParent(current);
        }
        return null;
    }

    private void AddTodo()
    {
        var title = InputTextBox.Text;
        if (string.IsNullOrWhiteSpace(title)) return;

        var category = (CategoryComboBox.SelectedItem as ComboBoxItem)?.Content.ToString() ?? "work";
        var item = new TodoItem { Title = title, Category = category, IsCompleted = false, Index = _todos.Count };
        item.PropertyChanged += (s, e) =>
        {
            if (e.PropertyName == nameof(TodoItem.IsCompleted))
                UpdateItemView(item);
        };
        _todos.Add(item);
        TodoListBox.Items.Refresh();
        InputTextBox.Text = string.Empty;
    }

    private void UpdateItemView(TodoItem item)
    {
        var index = _todos.IndexOf(item);
        if (index < 0) return;

        var container = TodoListBox.ItemContainerGenerator.ContainerFromIndex(index) as ListBoxItem;
        if (container == null) return;

        container.Content = CreateItemView(item);
    }

    private UIElement CreateItemView(TodoItem item)
    {
        var panel = new StackPanel { Orientation = Orientation.Horizontal };

        var checkBox = new CheckBox { IsChecked = item.IsCompleted };
        checkBox.Checked += (s, e) => item.IsCompleted = true;
        checkBox.Unchecked += (s, e) => item.IsCompleted = false;
        panel.Children.Add(checkBox);

        var titleLabel = new TextBlock
        {
            Text = item.Title,
            VerticalAlignment = VerticalAlignment.Center,
            Margin = new Thickness(8, 0, 0, 0)
        };
        panel.Children.Add(titleLabel);

        var categoryLabel = new TextBlock
        {
            Text = $"({item.Category})",
            VerticalAlignment = VerticalAlignment.Center,
            Margin = new Thickness(8, 0, 0, 0),
            Foreground = Brushes.Gray
        };
        panel.Children.Add(categoryLabel);

        var archiveButton = new Button
        {
            Content = "Archive",
            Visibility = item.IsCompleted ? Visibility.Visible : Visibility.Collapsed,
            Margin = new Thickness(16, 0, 0, 0)
        };
        archiveButton.Click += (s, e) =>
        {
            _todos.Remove(item);
            for (int i = 0; i < _todos.Count; i++)
            {
                _todos[i].Index = i;
            }
            TodoListBox.Items.Refresh();
        };
        panel.Children.Add(archiveButton);

        if (!item.IsCompleted)
        {
            var dragHandle = new TextBlock
            {
                Text = "\u2630",
                FontSize = 20,
                Margin = new Thickness(8, 0, 0, 0),
                VerticalAlignment = VerticalAlignment.Center,
                Cursor = Cursors.Hand
            };
            panel.Children.Add(dragHandle);
        }

        UpdateItemStyle(titleLabel, archiveButton, item.IsCompleted);

        return panel;
    }

    private void UpdateItemStyle(TextBlock titleLabel, Button archiveButton, bool isCompleted)
    {
        if (isCompleted)
        {
            titleLabel.TextDecorations = TextDecorations.Strikethrough;
            titleLabel.Foreground = Brushes.Gray;
            archiveButton.Visibility = Visibility.Visible;
        }
        else
        {
            titleLabel.TextDecorations = null;
            titleLabel.Foreground = Brushes.Black;
            archiveButton.Visibility = Visibility.Collapsed;
        }
    }
}