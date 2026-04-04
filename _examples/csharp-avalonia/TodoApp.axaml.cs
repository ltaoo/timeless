using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Media;

namespace TodoApp;

public class TodoItem : ObservableObject
{
    private string _title = string.Empty;
    public string Title
    {
        get => _title;
        set => SetAndRaise(ref _title, value);
    }

    private bool _isCompleted;
    public bool IsCompleted
    {
        get => _isCompleted;
        set => SetAndRaise(ref _isCompleted, value);
    }
}

public class MainWindow : Window
{
    private TextBox _inputTextBox;
    private Button _addButton;
    private ListBox _todoListBox;
    private ObservableCollection<TodoItem> _todos = new();

    public MainWindow()
    {
        Title = "Todo";
        Width = 400;
        Height = 500;
        SetupUI();
    }

    private void SetupUI()
    {
        var inputPanel = new StackPanel
        {
            Orientation = Orientation.Horizontal,
            Margin = new Thickness(0, 0, 0, 16)
        };

        _inputTextBox = new TextBox
        {
            Watermark = "Enter todo",
            Width = 280
        };
        inputPanel.Children.Add(_inputTextBox);

        _addButton = new Button
        {
            Content = "Add",
            Width = 80,
            Margin = new Thickness(8, 0, 0, 0)
        };
        _addButton.Click += (s, e) => AddTodo();
        inputPanel.Children.Add(_addButton);

        _todoListBox = new ListBox
        {
            ItemsSource = _todos
        };

        var mainPanel = new DockPanel { Margin = new Thickness(16) };
        mainPanel.Children.Add(inputPanel);
        DockPanel.SetDock(inputPanel, Dock.Top);
        mainPanel.Children.Add(_todoListBox);

        Content = mainPanel;

        _inputTextBox.KeyDown += (s, e) =>
        {
            if (e.Key == Key.Enter)
                AddTodo();
        };
    }

    private void AddTodo()
    {
        var title = _inputTextBox.Text;
        if (string.IsNullOrWhiteSpace(title))
            return;

        var item = new TodoItem { Title = title, IsCompleted = false };
        _todos.Add(item);

        UpdateItemView(item);

        item.PropertyChanged += (s, e) =>
        {
            if (e.PropertyName == nameof(TodoItem.IsCompleted))
                UpdateItemView(item);
        };

        _inputTextBox.Text = string.Empty;
    }

    private void UpdateItemView(TodoItem item)
    {
        var index = _todos.IndexOf(item);
        if (index < 0) return;

        var container = _todoListBox.ItemContainerGenerator.ContainerFromIndex(index) as ListBoxItem;
        if (container == null) return;

        container.Content = CreateItemView(item);
    }

    private Control CreateItemView(TodoItem item)
    {
        var panel = new StackPanel
        {
            Orientation = Orientation.Horizontal,
            Margin = new Thickness(8)
        };

        var checkBox = new CheckBox
        {
            IsChecked = item.IsCompleted
        };
        checkBox.Checked += (s, e) =>
        {
            item.IsCompleted = true;
        };
        checkBox.Unchecked += (s, e) =>
        {
            item.IsCompleted = false;
        };
        panel.Children.Add(checkBox);

        var titleLabel = new TextBlock
        {
            Text = item.Title,
            VerticalAlignment = Avalonia.Layout.VerticalAlignment.Center,
            Margin = new Thickness(8, 0, 0, 0)
        };
        panel.Children.Add(titleLabel);

        var archiveButton = new Button
        {
            Content = "Archive",
            IsVisible = item.IsCompleted,
            Margin = new Thickness(16, 0, 0, 0)
        };
        archiveButton.Click += (s, e) => _todos.Remove(item);
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
            archiveButton.IsVisible = true;
        }
        else
        {
            titleLabel.TextDecorations = null;
            titleLabel.Foreground = Brushes.Black;
            archiveButton.IsVisible = false;
        }
    }
}