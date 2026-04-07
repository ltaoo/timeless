using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
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

    public event PropertyChangedEventHandler? PropertyChanged;
    protected void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}

public partial class MainWindow : Window
{
    private List<TodoItem> _todos = new();

    public MainWindow()
    {
        InitializeComponent();
        TodoListBox.ItemsSource = _todos;
        AddButton.Click += (s, e) => AddTodo();
        InputTextBox.KeyDown += (s, e) => { if (e.Key == Key.Enter) AddTodo(); };
    }

    private void AddTodo()
    {
        var title = InputTextBox.Text;
        if (string.IsNullOrWhiteSpace(title)) return;

        var category = (CategoryComboBox.SelectedItem as ComboBoxItem)?.Content.ToString() ?? "work";
        var item = new TodoItem { Title = title, Category = category, IsCompleted = false };
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
            TodoListBox.Items.Refresh();
        };
        panel.Children.Add(archiveButton);

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