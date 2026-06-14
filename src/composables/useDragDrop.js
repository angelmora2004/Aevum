import { ref } from 'vue'

export function useDragDrop(items, onUpdate) {
  const draggedItem = ref(null)
  const draggedOver = ref(null)
  const isDragging = ref(false)

  function onDragStart(e, item, index) {
    draggedItem.value = { item, index }
    isDragging.value = true
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    e.target.closest('.drag-item')?.classList.add('dragging')
  }

  function onDragEnd(e) {
    e.target.closest('.drag-item')?.classList.remove('dragging')
    draggedItem.value = null
    draggedOver.value = null
    isDragging.value = false
  }

  function onDragOver(e, index) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    draggedOver.value = index
  }

  function onDragLeave() {
    draggedOver.value = null
  }

  function onDrop(e, toIndex) {
    e.preventDefault()
    if (draggedItem.value === null) return

    const fromIndex = draggedItem.value.index
    if (fromIndex === toIndex) return

    const newItems = [...items.value]
    const [moved] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, moved)

    // Update sort_order
    newItems.forEach((item, i) => { item.sort_order = i })

    if (onUpdate) onUpdate(newItems)

    draggedItem.value = null
    draggedOver.value = null
    isDragging.value = false
  }

  function isDragOver(index) {
    return draggedOver.value === index && draggedItem.value?.index !== index
  }

  return {
    draggedItem, draggedOver, isDragging,
    onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, isDragOver
  }
}
