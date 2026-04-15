package com.example.todo

import android.content.ClipData
import android.content.ClipDescription
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.view.DragEvent
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var editText: EditText
    private lateinit var addButton: Button
    private lateinit var listView: ListView
    private lateinit var categorySpinner: Spinner

    private val todos = mutableListOf<TodoItem>()
    private val categories = listOf("work", "daily")
    private var selectedCategory = "work"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setupUI()
    }

    private fun setupUI() {
        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
        }

        categorySpinner = Spinner(this).apply {
            val adapter = ArrayAdapter(this@MainActivity, android.R.layout.simple_spinner_item, categories)
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            this.adapter = adapter
            onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                    selectedCategory = categories[position]
                }
                override fun onNothingSelected(parent: AdapterView<*>?) {}
            }
        }
        container.addView(categorySpinner)

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
            }, { fromPosition, toPosition ->
                val item = todos.removeAt(fromPosition)
                todos.add(toPosition, item)
                (adapter as TodoAdapter).notifyDataSetChanged()
            })
        }
        container.addView(listView)

        setContentView(container)
    }

    private fun addTodo() {
        val title = editText.text.toString()
        if (title.isEmpty()) return
        todos.add(0, TodoItem(title, selectedCategory, false))
        editText.text.clear()
        (listView.adapter as TodoAdapter).notifyDataSetChanged()
    }

    fun removeTodo(position: Int) {
        todos.removeAt(position)
        (listView.adapter as TodoAdapter).notifyDataSetChanged()
    }
}

data class TodoItem(val title: String, val category: String, val isCompleted: Boolean)

class TodoAdapter(
    private val todos: List<TodoItem>,
    private val onCheckChanged: (Int, Boolean) -> Unit,
    private val onArchive: (Int) -> Unit,
    private val onReorder: (Int, Int) -> Unit
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

        val categoryLabel = if (convertView == null) {
            TextView(context).also { (view as LinearLayout).addView(it) }
        } else {
            (view as LinearLayout).getChildAt(2) as TextView
        }

        val archiveButton = if (convertView == null) {
            Button(context).apply { text = "Archive" }
                .also { (view as LinearLayout).addView(it) }
        } else {
            (view as LinearLayout).getChildAt(3) as Button
        }

        val dragHandle = if (convertView == null) {
            ImageView(context).apply {
                setImageDrawable(android.R.drawable.ic_menu_sort_by_size)
                setPadding(16, 0, 16, 0)
            }.also { (view as LinearLayout).addView(it, 4) }
        } else {
            (view as LinearLayout).getChildAt(4) as ImageView
        }

        val todo = todos[position]
        checkBox.isChecked = todo.isCompleted
        checkBox.setOnCheckedChangeListener { _, isChecked ->
            onCheckChanged(position, isChecked)
        }

        titleLabel.text = todo.title
        categoryLabel.text = "(${todo.category})"
        categoryLabel.setTextColor(android.graphics.Color.GRAY)

        if (todo.isCompleted) {
            titleLabel.paintFlags = titleLabel.paintFlags or android.graphics.Paint.STRIKE_THRU_TEXT_FLAG
            titleLabel.setTextColor(android.graphics.Color.GRAY)
            archiveButton.visibility = View.VISIBLE
            archiveButton.setOnClickListener { onArchive(position) }
            dragHandle.visibility = View.GONE
        } else {
            titleLabel.paintFlags = titleLabel.paintFlags and android.graphics.Paint.STRIKE_THRU_TEXT_FLAG.inv()
            titleLabel.setTextColor(android.graphics.Color.BLACK)
            archiveButton.visibility = View.GONE
            dragHandle.visibility = View.VISIBLE
            
            dragHandle.setOnLongClickListener { v ->
                val clipData = ClipData.newPlainText("position", position.toString())
                val shadowBuilder = View.DragShadowBuilder(v)
                v.startDragAndDrop(clipData, shadowBuilder, position, 0)
                true
            }
            
            view.setOnDragListener { v, event ->
                when (event.action) {
                    DragEvent.ACTION_DRAG_STARTED -> {
                        event.clipDescription?.hasMimeType(ClipDescription.MIMETYPE_TEXT_PLAIN) == true
                    }
                    DragEvent.ACTION_DROP -> {
                        val fromPosition = event.localState as Int
                        val toPosition = position
                        if (fromPosition != toPosition) {
                            onReorder(fromPosition, toPosition)
                        }
                        true
                    }
                    else -> true
                }
            }
        }

        titleLabel.text = todo.title

        return view
    }
}