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

    private string _category = "work";
    public string Category
    {
        get => _category;
        set => SetAndRaise(ref _category, value);
    }

    private bool _isCompleted;
    public bool IsCompleted
    {
        get => _isCompleted;
        set => SetAndRaise(ref _isCompleted, value);
    }

    public int Index { get; set; }
}

public class MainWindow : Window
{
    private TextBox _inputTextBox;
    private Button _addButton;
    private ListBox _todoListBox;
    private ComboBox _categoryComboBox;
    private ObservableCollection<TodoItem> _todos = new();
    private ObservableCollection<string> _categories = new() { "work", "daily" };
    private Point _startPoint;
    private bool _isDragging;
    private TodoItem? _draggedItem;

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

        _categoryComboBox = new ComboBox
        {
            Width = 100,
            ItemsSource = _categories,
            SelectedIndex = 0
        };
        inputPanel.Children.Add(_categoryComboBox);

        _inputTextBox = new TextBox
        {
            Watermark = "Enter todo",
            Width = 200,
            Margin = new Thickness(8, 0, 0, 0)
        };
        inputPanel.Children.Add(_inputTextBox);

        _addButton = new Button
        {
            Width = 44,
            Margin = new Thickness(8, 0, 0, 0),
            Content = new PathIcon
            {
                Data = StreamGeometry.Parse("M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"),
                Width = 24,
                Height = 24
            }
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

        var category = _categoryComboBox.SelectedItem as string ?? "work";
        var item = new TodoItem { Title = title, Category = category, IsCompleted = false, Index = _todos.Count };
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

        var categoryLabel = new TextBlock
        {
            Text = $"({item.Category})",
            VerticalAlignment = Avalonia.Layout.VerticalAlignment.Center,
            Margin = new Thickness(8, 0, 0, 0),
            Foreground = Brushes.Gray
        };
        panel.Children.Add(categoryLabel);

        var archiveButton = new Button
        {
            Content = "Archive",
            IsVisible = item.IsCompleted,
            Margin = new Thickness(16, 0, 0, 0)
        };
        archiveButton.Click += (s, e) =>
        {
            _todos.Remove(item);
            for (int i = 0; i < _todos.Count; i++)
            {
                _todos[i].Index = i;
            }
        };
        panel.Children.Add(archiveButton);

        if (!item.IsCompleted)
        {
            var dragHandle = new TextBlock
            {
                Text = "\u2630",
                FontSize = 20,
                Margin = new Thickness(8, 0, 0, 0),
                VerticalAlignment = Avalonia.Layout.VerticalAlignment.Center,
                Cursor = new Cursor(StandardCursorType.Hand)
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