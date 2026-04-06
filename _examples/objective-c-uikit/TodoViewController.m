#import <UIKit/UIKit.h>

@interface TodoViewController : UIViewController
@end

@implementation TodoViewController {
    UITextField *_textField;
    UIButton *_addButton;
    UITableView *_tableView;
    NSMutableArray<NSDictionary *> *_todos;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    _todos = [NSMutableArray array];
    [self setupUI];
}

- (void)setupUI {
    self.view.backgroundColor = [UIColor whiteColor];
    
    _textField = [[UITextField alloc] init];
    _textField.placeholder = @"Enter todo";
    _textField.borderStyle = UITextBorderStyleRoundedRect;
    _textField.translatesAutoresizingMaskIntoConstraints = NO;
    [self.view addSubview:_textField];
    
    _addButton = [UIButton buttonWithType:UIButtonTypeSystem];
    if (@available(iOS 13.0, *)) {
        UIImage *addIcon = [UIImage systemImageNamed:@"plus.circle.fill"];
        [_addButton setImage:addIcon forState:UIControlStateNormal];
    } else {
        [_addButton setTitle:@"Add" forState:UIControlStateNormal];
    }
    _addButton.translatesAutoresizingMaskIntoConstraints = NO;
    [_addButton addTarget:self action:@selector(addTodo) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:_addButton];
    
    _tableView = [[UITableView alloc] initWithFrame:CGRectZero style:UITableViewStylePlain];
    _tableView.translatesAutoresizingMaskIntoConstraints = NO;
    _tableView.dataSource = self;
    [_tableView registerClass:[TodoCell class] forCellReuseIdentifier:@"TodoCell"];
    [self.view addSubview:_tableView];
    
    [NSLayoutConstraint activateConstraints:@[
        [_textField.topAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.topAnchor constant:16],
        [_textField.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor constant:16],
        [_textField.trailingAnchor constraintEqualToAnchor:_addButton.leadingAnchor constant:-8],
        
        [_addButton.centerYAnchor constraintEqualToAnchor:_textField.centerYAnchor],
        [_addButton.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor constant:-16],
        [_addButton.widthAnchor constraintEqualToConstant:60],
        
        [_tableView.topAnchor constraintEqualToAnchor:_textField.bottomAnchor constant:16],
        [_tableView.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor],
        [_tableView.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor],
        [_tableView.bottomAnchor constraintEqualToAnchor:self.view.bottomAnchor]
    ]];
}

- (void)addTodo {
    NSString *title = _textField.text;
    if (title.length == 0) return;
    [_todos addObject:@{@"title": title, @"isCompleted": @NO}];
    _textField.text = @"";
    [_tableView reloadData];
}

#pragma mark - UITableViewDataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return _todos.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    TodoCell *cell = [tableView dequeueReusableCellWithIdentifier:@"TodoCell" forIndexPath:indexPath];
    NSDictionary *todo = _todos[indexPath.row];
    [cell configureWithTitle:todo[@"title"] isCompleted:[todo[@"isCompleted"] boolValue]];
    __weak typeof(self) weakSelf = self;
    cell.onCheckChanged = ^(BOOL isCompleted) {
        NSMutableDictionary *mutableTodo = [weakSelf.todos[indexPath.row] mutableCopy];
        mutableTodo[@"isCompleted"] = @(isCompleted);
        weakSelf.todos[indexPath.row] = mutableTodo;
    };
    cell.onArchive = ^{
        [weakSelf.todos removeObjectAtIndex:indexPath.row];
        [tableView deleteRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationAutomatic];
    };
    return cell;
}

@end

#pragma mark - TodoCell

@interface TodoCell : UITableViewCell
@property (nonatomic, copy) void (^onCheckChanged)(BOOL);
@property (nonatomic, copy) void (^onArchive)(void);
@end

@implementation TodoCell {
    UISwitch *_checkBox;
    UILabel *_titleLabel;
    UIButton *_archiveButton;
}

- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier {
    self = [super initWithStyle:style reuseIdentifier:reuseIdentifier];
    if (self) {
        [self setupUI];
    }
    return self;
}

- (void)setupUI {
    _checkBox = [[UISwitch alloc] init];
    _checkBox.translatesAutoresizingMaskIntoConstraints = NO;
    [_checkBox addTarget:self action:@selector(checkChanged) forControlEvents:UIControlEventValueChanged];
    [self.contentView addSubview:_checkBox];
    
    _titleLabel = [[UILabel alloc] init];
    _titleLabel.translatesAutoresizingMaskIntoConstraints = NO;
    [self.contentView addSubview:_titleLabel];
    
    _archiveButton = [UIButton buttonWithType:UIButtonTypeSystem];
    [_archiveButton setTitle:@"Archive" forState:UIControlStateNormal];
    _archiveButton.translatesAutoresizingMaskIntoConstraints = NO;
    [_archiveButton addTarget:self action:@selector(archiveTapped) forControlEvents:UIControlEventTouchUpInside];
    _archiveButton.hidden = YES;
    [self.contentView addSubview:_archiveButton];
    
    [NSLayoutConstraint activateConstraints:@[
        [_checkBox.leadingAnchor constraintEqualToAnchor:self.contentView.leadingAnchor constant:16],
        [_checkBox.centerYAnchor constraintEqualToAnchor:self.contentView.centerYAnchor],
        
        [_titleLabel.leadingAnchor constraintEqualToAnchor:_checkBox.trailingAnchor constant:12],
        [_titleLabel.centerYAnchor constraintEqualToAnchor:self.contentView.centerYAnchor],
        
        [_archiveButton.leadingAnchor constraintEqualToAnchor:_titleLabel.trailingAnchor constant:8],
        [_archiveButton.trailingAnchor constraintEqualToAnchor:self.contentView.trailingAnchor constant:-16],
        [_archiveButton.centerYAnchor constraintEqualToAnchor:self.contentView.centerYAnchor]
    ]];
}

- (void)configureWithTitle:(NSString *)title isCompleted:(BOOL)isCompleted {
    _checkBox.on = isCompleted;
    _titleLabel.textColor = isCompleted ? [UIColor grayColor] : [UIColor blackColor];
    _archiveButton.hidden = !isCompleted;
    
    if (isCompleted) {
        NSDictionary *attributes = @{NSStrikethroughStyleAttributeName: @(NSUnderlineStyleSingle)};
        _titleLabel.attributedText = [[NSAttributedString alloc] initWithString:title attributes:attributes];
    } else {
        _titleLabel.attributedText = nil;
        _titleLabel.text = title;
    }
}

- (void)checkChanged {
    BOOL isCompleted = _checkBox.on;
    _titleLabel.textColor = isCompleted ? [UIColor grayColor] : [UIColor blackColor];
    _archiveButton.hidden = !isCompleted;
    
    if (isCompleted) {
        NSDictionary *attributes = @{NSStrikethroughStyleAttributeName: @(NSUnderlineStyleSingle)};
        _titleLabel.attributedText = [[NSAttributedString alloc] initWithString:_titleLabel.text ?: @"" attributes:attributes];
    } else {
        _titleLabel.attributedText = nil;
        _titleLabel.text = _titleLabel.text;
    }
    
    if (self.onCheckChanged) {
        self.onCheckChanged(isCompleted);
    }
}

- (void)archiveTapped {
    if (self.onArchive) {
        self.onArchive();
    }
}

@end