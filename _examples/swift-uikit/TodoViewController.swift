import UIKit

class TodoViewController: UIViewController {
    
    private let textField = UITextField()
    private let addButton = UIButton(type: .system)
    private let tableView = UITableView()
    private let categorySegment = UISegmentedControl(items: ["work", "daily"])
    
    private var todos: [(title: String, category: String, isCompleted: Bool)] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }
    
    private func setupUI() {
        view.backgroundColor = .white
        
        categorySegment.selectedSegmentIndex = 0
        categorySegment.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(categorySegment)
        
        textField.placeholder = "Enter todo"
        textField.borderStyle = .roundedRect
        textField.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(textField)
        
        addButton.setImage(UIImage(systemName: "plus.circle.fill"), for: .normal)
        addButton.translatesAutoresizingMaskIntoConstraints = false
        addButton.addTarget(self, action: #selector(addTodo), for: .touchUpInside)
        view.addSubview(addButton)
        
        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.dataSource = self
        tableView.register(TodoCell.self, forCellReuseIdentifier: "TodoCell")
        view.addSubview(tableView)
        
        NSLayoutConstraint.activate([
            categorySegment.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
            categorySegment.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            categorySegment.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            
            textField.topAnchor.constraint(equalTo: categorySegment.bottomAnchor, constant: 16),
            textField.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            textField.trailingAnchor.constraint(equalTo: addButton.leadingAnchor, constant: -8),
            
            addButton.centerYAnchor.constraint(equalTo: textField.centerYAnchor),
            addButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            addButton.widthAnchor.constraint(equalToConstant: 44),
            
            tableView.topAnchor.constraint(equalTo: textField.bottomAnchor, constant: 16),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }
    
    @objc private func addTodo() {
        guard let title = textField.text, !title.isEmpty else { return }
        let category = categorySegment.selectedSegmentIndex == 0 ? "work" : "daily"
        todos.append((title: title, category: category, isCompleted: false))
        textField.text = ""
        tableView.reloadData()
    }
}

extension TodoViewController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return todos.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "TodoCell", for: indexPath) as! TodoCell
        let todo = todos[indexPath.row]
        cell.configure(title: todo.title, category: todo.category, isCompleted: todo.isCompleted)
        cell.onCheckChanged = { [weak self] isCompleted in
            self?.todos[indexPath.row].isCompleted = isCompleted
        }
        cell.onArchive = { [weak self] in
            self?.todos.remove(at: indexPath.row)
            tableView.deleteRows(at: [indexPath], with: .automatic)
        }
        return cell
    }
}

class TodoCell: UITableViewCell {
    private let checkBox = UISwitch()
    private let titleLabel = UILabel()
    private let categoryLabel = UILabel()
    private let archiveButton = UIButton(type: .system)
    var onCheckChanged: ((Bool) -> Void)?
    var onArchive: (() -> Void)?
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupUI()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupUI() {
        checkBox.translatesAutoresizingMaskIntoConstraints = false
        checkBox.addTarget(self, action: #selector(checkChanged), for: .valueChanged)
        contentView.addSubview(checkBox)
        
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(titleLabel)
        
        categoryLabel.translatesAutoresizingMaskIntoConstraints = false
        categoryLabel.textColor = .gray
        contentView.addSubview(categoryLabel)
        
        archiveButton.translatesAutoresizingMaskIntoConstraints = false
        archiveButton.setTitle("Archive", for: .normal)
        archiveButton.addTarget(self, action: #selector(archiveTapped), for: .touchUpInside)
        archiveButton.isHidden = true
        contentView.addSubview(archiveButton)
        
        NSLayoutConstraint.activate([
            checkBox.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            checkBox.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            
            titleLabel.leadingAnchor.constraint(equalTo: checkBox.trailingAnchor, constant: 12),
            titleLabel.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            
            categoryLabel.leadingAnchor.constraint(equalTo: titleLabel.trailingAnchor, constant: 8),
            categoryLabel.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            
            archiveButton.leadingAnchor.constraint(equalTo: categoryLabel.trailingAnchor, constant: 8),
            archiveButton.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            archiveButton.centerYAnchor.constraint(equalTo: contentView.centerYAnchor)
        ])
    }
    
    func configure(title: String, category: String, isCompleted: Bool) {
        titleLabel.text = title
        categoryLabel.text = "(\(category))"
        checkBox.isOn = isCompleted
        titleLabel.textColor = isCompleted ? .gray : .black
        
        if isCompleted {
            let attributedString = NSAttributedString(
                string: title,
                attributes: [.strikethroughStyle: NSUnderlineStyle.single.rawValue]
            )
            titleLabel.attributedText = attributedString
        } else {
            titleLabel.attributedText = nil
            titleLabel.text = title
        }
        
        archiveButton.isHidden = !isCompleted
    }
    
    @objc private func checkChanged() {
        let isCompleted = checkBox.isOn
        onCheckChanged?(isCompleted)
        
        titleLabel.textColor = isCompleted ? .gray : .black
        
        if isCompleted {
            let attributedString = NSAttributedString(
                string: titleLabel.text ?? "",
                attributes: [.strikethroughStyle: NSUnderlineStyle.single.rawValue]
            )
            titleLabel.attributedText = attributedString
        } else {
            titleLabel.attributedText = nil
            titleLabel.text = titleLabel.text
        }
        
        archiveButton.isHidden = !isCompleted
    }
    
    @objc private func archiveTapped() {
        onArchive?()
    }
}