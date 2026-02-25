/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node, mergeAttributes } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { Suggestion, SuggestionProps } from '@tiptap/suggestion'

export interface ParamItem {
  key: string
  value: string
}

export const parameterTagPluginKey = new PluginKey('parameterTagSuggestion')

export const ParameterTag = Node.create({
  name: 'parameterTag',
  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return {
      getParams: (): ParamItem[] => [],
    }
  },

  addAttributes() {
    return {
      key: { default: '' },
      value: { default: '' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-parameter-tag]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        {
          class: 'inline-block px-2 py-0.5 bg-muted border border-border rounded font-mono text-sm whitespace-nowrap text-foreground',
          'data-parameter-tag': node.attrs.key,
        },
        HTMLAttributes,
      ),
      `"${node.attrs.key}":"${node.attrs.value}"`,
    ]
  },

  // 👇👇 THE REAL FIX: Suggestion belongs in addProseMirrorPlugins()
  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: parameterTagPluginKey,
        editor: this.editor,
        char: '@',
        
        // Allow spaces in the search
        allowSpaces: false,
        
        // Start suggestion immediately after typing the trigger char
        startOfLine: false,
        
        // NOW this.options.getParams() WORKS
        items: ({ query }: { query: string }) => {
          const params = this.options.getParams()
          
          if (!query) {
            return params
          }
          
          // Filter params based on query
          return params.filter((item: ParamItem) =>
            item.key.toLowerCase().includes(query.toLowerCase()) ||
            item.value.toLowerCase().includes(query.toLowerCase())
          )
        },

        command: ({ editor, range, props }: { editor: any; range: any; props: ParamItem }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: 'parameterTag',
              attrs: { key: props.key, value: props.value },
            })
            .run()
        },

        render: () => {
          let popup: HTMLElement | null = null
          let items: ParamItem[] = []
          let command: any = null
          let selectedIndex = 0
          let currentProps: SuggestionProps<ParamItem, ParamItem> | null = null
          let scrollHandler: (() => void) | null = null

          const destroyPopup = () => {
            if (scrollHandler) {
              window.removeEventListener('scroll', scrollHandler, true)
              scrollHandler = null
            }
            popup?.remove()
            popup = null
            currentProps = null
          }

          const updatePopup = () => {
            if (!popup) return
            
            popup.innerHTML = ''

            if (items.length === 0) {
              const noItems = document.createElement('div')
              noItems.textContent = 'No parameters available'
              noItems.className = 'px-3 py-2 text-sm text-muted-foreground whitespace-nowrap'
              popup.appendChild(noItems)
              return
            }

            items.forEach((item, index) => {
              const option = document.createElement('div')
              option.textContent = `"${item.key}":"${item.value}"`
              option.className = 'px-3 py-2 text-sm cursor-pointer rounded whitespace-nowrap transition-colors duration-150 hover:bg-muted'

              if (index === selectedIndex) {
                option.classList.add('bg-muted')
              }

              option.onclick = () => command(item)
              popup!.appendChild(option)
            })
          }

          const updatePopupPosition = () => {
            if (!popup || !currentProps) return

            const rect = currentProps.clientRect?.()
            
            if (!rect) return

            const popupRect = popup.getBoundingClientRect()
            const popupHeight = Math.min(popupRect.height || 300, 300)
            const popupWidth = Math.max(popupRect.width || 220, 220)
            
            const viewportHeight = window.innerHeight
            const viewportWidth = window.innerWidth
            
            // Verificar si el @ está visible en el viewport
            const atSymbolVisible = rect.top >= 0 && rect.bottom <= viewportHeight &&
                                    rect.left >= 0 && rect.right <= viewportWidth
            
            let top: number
            let left = rect.left
            
            // Ajustar posición horizontal
            if (left + popupWidth > viewportWidth) {
              left = viewportWidth - popupWidth - 10
            }
            if (left < 10) {
              left = 10
            }
            
            if (atSymbolVisible) {
              // El @ es visible, posicionar cerca de él
              const spaceBelow = viewportHeight - rect.bottom
              const spaceAbove = rect.top
              
              if (spaceBelow >= popupHeight + 5) {
                // Hay espacio abajo
                top = rect.bottom + 5
              } else if (spaceAbove >= popupHeight + 5) {
                // Hay espacio arriba
                top = rect.top - popupHeight - 5
              } else if (spaceBelow > spaceAbove) {
                // Más espacio abajo, anclar abajo
                top = viewportHeight - popupHeight - 10
              } else {
                // Más espacio arriba, anclar arriba
                top = 10
              }
            } else {
              // El @ no es visible, anclar el popup
              if (rect.top < 0) {
                // @ está arriba del viewport, anclar popup arriba
                top = 10
              } else {
                // @ está abajo del viewport, anclar popup abajo
                top = viewportHeight - popupHeight - 10
              }
            }
            
            // Asegurar que el popup esté dentro del viewport
            if (top < 10) top = 10
            if (top + popupHeight > viewportHeight - 10) {
              top = viewportHeight - popupHeight - 10
            }
            
            popup.style.top = `${top}px`
            popup.style.left = `${left}px`
          }

          return {
            onStart: (props: SuggestionProps<ParamItem, ParamItem>) => {
              items = props.items
              command = props.command
              selectedIndex = 0
              currentProps = props

              popup = document.createElement('div')
              popup.className = 'fixed bg-white dark:bg-card border border-border rounded-md p-1 font-mono text-sm z-[99999] min-w-[220px] max-h-[300px] overflow-y-auto shadow-lg'

              updatePopup()
              document.body.appendChild(popup)
              
              // Esperar un frame para que el popup tenga dimensiones
              requestAnimationFrame(() => {
                updatePopupPosition()
              })
              
              // Agregar listener de scroll
              scrollHandler = () => {
                requestAnimationFrame(() => {
                  updatePopupPosition()
                })
              }
              window.addEventListener('scroll', scrollHandler, true)
            },

            onUpdate: (props: SuggestionProps<ParamItem, ParamItem>) => {
              items = props.items
              command = props.command
              selectedIndex = 0
              currentProps = props
              updatePopup()
              requestAnimationFrame(() => {
                updatePopupPosition()
              })
            },

            onKeyDown: ({ event }: { event: KeyboardEvent }) => {
              if (event.key === 'ArrowDown') {
                selectedIndex = (selectedIndex + 1) % items.length
                updatePopup()
                return true
              }

              if (event.key === 'ArrowUp') {
                selectedIndex = (selectedIndex - 1 + items.length) % items.length
                updatePopup()
                return true
              }

              if (event.key === 'Enter' || event.key === 'Tab') {
                event.preventDefault()
                command(items[selectedIndex])
                return true
              }

              if (event.key === 'Escape') {
                destroyPopup()
                return true
              }

              return false
            },

            onExit: () => {
              destroyPopup()
            },
          }
        },
      }),
    ]
  },
})

/**
 * Actualiza nodos existentes cuando los inputs externos cambian.
 */
export function syncParameterNodes(editor: any, params: ParamItem[]) {
  editor.state.doc.descendants((node: any, pos: number) => {
    if (node.type.name === 'parameterTag') {
      const updated = params.find((p) => p.key === node.attrs.key)
      if (updated && updated.value !== node.attrs.value) {
        editor
          .chain()
          .setNodeSelection(pos)
          .updateAttributes('parameterTag', { value: updated.value })
          .run()
      }
    }
  })
}