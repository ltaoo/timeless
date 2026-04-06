package com.example.todo

import android.graphics.drawable.Drawable
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var editText: EditText
    private lateinit var addButton: Button
    private lateinit var listView: ListView

    private val todos = mutableListOf<TodoItem>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setupUI()
    }

    private fun setupUI() {
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
        }

        editText = EditText(this).apply {
            hint = "Enter todo"
        }
        container.addView(editText)

        addButton = Button(this).apply {
            text = ""
            val icon: Drawable? = ContextCompat.getDrawable(context, android.R.drawable.ic_input_add)
            setCompoundDrawablesWithIntrinsicBounds(icon, null, null, null)
            setOnClickListener { addTodo() }
        }
        container.addView(addButton)

        listView = ListView(this).apply {
            adapter = TodoAdapter(todos, { position, isChecked ->
                todos[position] = todos[position].copy(isCompleted = isChecked)
                (adapter as TodoAdapter).notifyDataSetChanged()
            }, { position ->
                removeTodo(position)
            })
        }
        container.addView(listView)

        setContentView(container)
    }

    private fun addTodo() {
        val title = editText.text.toString()
        if (title.isEmpty()) return
        todos.add(TodoItem(title, false))
        editText.text.clear()
        (listView.adapter as TodoAdapter).notifyDataSetChanged()
    }

    fun removeTodo(position: Int) {
        todos.removeAt(position)
        (listView.adapter as TodoAdapter).notifyDataSetChanged()
    }
}

data class TodoItem(val title: String, val isCompleted: Boolean)

class TodoAdapter(
    private val todos: List<TodoItem>,
    private val onCheckChanged: (Int, Boolean) -> Unit,
    private val onArchive: (Int) -> Unit
) : BaseAdapter() {

    override fun getCount(): Int = todos.size

    override fun getItem(position: Int): Any = todos[position]

    override fun getItemId(position: Int): Long = position.toLong()

    override fun getView(position: Int, convertView: View?, parent: android.view.ViewGroup): View {
        val view = convertView ?: LinearLayout(parent.context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = android.view.Gravity.CENTER_VERTICAL
            setPadding(16, 16, 16, 16)
        }

        val checkBox = if (convertView == null) {
            CheckBox(context).also { (view as LinearLayout).addView(it, 0) }
        } else {
            (view as LinearLayout).getChildAt(0) as CheckBox
        }

        val titleLabel = if (convertView == null) {
            TextView(context).also { (view as LinearLayout).addView(it) }
        } else {
            (view as LinearLayout).getChildAt(1) as TextView
        }

        val archiveButton = if (convertView == null) {
            Button(context).apply { text = "Archive" }
                .also { (view as LinearLayout).addView(it) }
        } else {
            (view as LinearLayout).getChildAt(2) as Button
        }

        val todo = todos[position]
        checkBox.isChecked = todo.isCompleted
        checkBox.setOnCheckedChangeListener { _, isChecked ->
            onCheckChanged(position, isChecked)
        }

        if (todo.isCompleted) {
            titleLabel.paintFlags = titleLabel.paintFlags or android.graphics.Paint.STRIKE_THRU_TEXT_FLAG
            titleLabel.setTextColor(android.graphics.Color.GRAY)
            archiveButton.visibility = View.VISIBLE
            archiveButton.setOnClickListener { onArchive(position) }
        } else {
            titleLabel.paintFlags = titleLabel.paintFlags and android.graphics.Paint.STRIKE_THRU_TEXT_FLAG.inv()
            titleLabel.setTextColor(android.graphics.Color.BLACK)
            archiveButton.visibility = View.GONE
        }

        titleLabel.text = todo.title

        return view
    }
}