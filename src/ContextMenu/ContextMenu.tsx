import * as React from "react"
import isString from "lodash/isString"

import { DefaultProps } from "../types"
import styled from "../utils/styled"
import ContextMenuItem, { IContextMenuItem } from "./ContextMenu.Item"
import { useUniqueId } from "../useUniqueId"
import { useListbox } from "../useListbox"

export interface ContextMenuProps extends DefaultProps {
  children: React.ReactNode | ((isActive: boolean) => React.ReactNode)
  /** Specify whether the menu items are visible. Overrides internal open state that triggers on click. */
  open?: boolean
  /** Condensed mode */
  condensed?: boolean
  /** onClick method for all menu items */
  onClick?: (item: IContextMenuItem) => void
  /** Handles click events anywhere outside the context menu container, including menu items. */
  onOutsideClick?: () => void
  /** Suppresses the default behavior of closing the context menu when one of its items is clicked. */
  keepOpenOnItemClick?: boolean
  /** Menu items */
  items: Array<string | IContextMenuItem>
  /** Where shall we place an icon in rows? */
  iconLocation?: "left" | "right"
  /** Alignment */
  align?: "left" | "right"
  /** Custom width */
  width?: number
  /* Is the child disabled? */
  disabled?: boolean
  /**
   * Whether to include the click element in the context menu styling.
   * Only recommended when the click element is the same width as the context menu.
   */
  embedChildrenInMenu?: boolean
  /** Where do we start focus from? */
  initialFocusedItemIndex?: number
}

export interface State {
  isOpen: boolean
  focusedItemIndex: number
}

const isChildAFunction = (children: ContextMenuProps["children"]): children is (isActive: boolean) => React.ReactNode =>
  typeof children === "function"

const Container = styled("div")<{ side: ContextMenuProps["align"]; isOpen: boolean }>(
  ({ isOpen, theme, side: align }) => ({
    label: "contextmenu",
    cursor: "pointer",
    outline: "none",
    position: "relative",
    width: "fit-content",
    display: "flex",
    alignItems: "center",
    justifyContent: align === "left" ? "flex-start" : "flex-end",
    zIndex: isOpen ? theme.zIndex.selectOptions + 1 : theme.zIndex.selectOptions,
  }),
)

const rowHeight = 40
const condensedRowHeight = 35

const MenuContainer = styled("div")<{
  embedChildrenInMenu?: ContextMenuProps["embedChildrenInMenu"]
  numRows: number
  align: ContextMenuProps["align"]
  condensed: boolean
}>(({ theme, numRows, align, embedChildrenInMenu, condensed }) => ({
  position: "absolute",
  top: embedChildrenInMenu ? 0 : "100%",
  left: align === "left" ? 0 : "auto",
  maxHeight: "50vh",
  overflow: "auto",
  boxShadow: theme.shadows.popup,
  width: "100%",
  minWidth: "fit-content",
  display: "grid",
  gridTemplateRows: `repeat(${numRows}, ${condensed ? condensedRowHeight : rowHeight}px)`,
}))

/**
 * Overlay to prevent mouse events when the context menu is open
 */
const InvisibleOverlay = styled("div")(({ theme }) => ({
  position: "fixed",
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
  cursor: "default",
  zIndex: theme.zIndex.selectOptions + 1,
}))

const ContextMenu: React.FC<ContextMenuProps> = ({
  id,
  align = "left",
  embedChildrenInMenu = false,
  keepOpenOnItemClick,
  condensed,
  iconLocation,
  children,
  items,
  onClick,
  disabled,
  width,
  ...props
}) => {
  const uniqueId = useUniqueId(id)
  const { isOpen, setIsOpen, buttonProps, listboxProps, getChildProps, focusedOptionIndex } = useListbox({
    itemCount: items.length,
    isMultiSelect: keepOpenOnItemClick,
    isDisabled: disabled,
  })

  /**
   * Preserve the public API: if users submit strings in props.items,
   * convert them into actual ContextMenuItems.
   */
  const makeItem = React.useCallback(
    (itemFromProps: ContextMenuProps["items"][-1]) =>
      typeof itemFromProps === "string" ? { label: itemFromProps } : itemFromProps,
    [],
  )

  React.useEffect(() => {
    if (!items) {
      throw new Error("No array of items has been provided for the ContextMenu.")
    }
  }, [items])

  const renderedChildren = React.useMemo(
    () => (isChildAFunction(children) ? children(isOpen ? isOpen : false) : children),
    [isOpen, children],
  )

  const currentItem = React.useMemo(() => {
    if (focusedOptionIndex === null || focusedOptionIndex === undefined) {
      return
    }
    const tentativeItem = items[focusedOptionIndex]
    if (typeof tentativeItem === "string") {
      return makeItem(tentativeItem)
    }

    return tentativeItem
  }, [focusedOptionIndex, items])

  const handleSelect = React.useCallback(() => {
    if (currentItem && currentItem.onClick) {
      currentItem.onClick(currentItem)
      return
    }
    if (currentItem && onClick) {
      onClick(currentItem)
    }
  }, [currentItem, onClick])

  return (
    <>
      {isOpen && (
        <InvisibleOverlay
          onClick={e => {
            e.stopPropagation()
            setIsOpen && setIsOpen(false)
          }}
        />
      )}
      <Container
        {...props}
        isOpen={isOpen || false}
        side={align}
        onClick={e => {
          e.stopPropagation()
          if (keepOpenOnItemClick && isOpen) {
            return
          }
          if (!disabled && setIsOpen) {
            setIsOpen(!isOpen)
          }
        }}
        onKeyDown={e => {
          switch (e.key) {
            case "Enter":
              if (keepOpenOnItemClick) {
                e.stopPropagation()
              }
              handleSelect()
              break
          }
        }}
      >
        <div style={{ outline: "none", width: "100%" }} {...buttonProps}>
          {renderedChildren}
        </div>
        <MenuContainer
          {...listboxProps}
          condensed={Boolean(condensed)}
          numRows={items.length}
          align={align}
          embedChildrenInMenu={embedChildrenInMenu}
        >
          {embedChildrenInMenu && renderedChildren}
          {items.map((item, index: number) => (
            <ContextMenuItem
              id={`operational-ui__ContextMenuItem-${uniqueId}-${index}`}
              isActive={typeof item !== "string" && item.isActive}
              key={`contextmenu-${index}`}
              condensed={condensed}
              align={align}
              iconLocation={iconLocation}
              width={width || "100%"}
              item={item}
              disabled={isString(item) ? !onClick : !item.onClick && !onClick}
              onClick={e => {
                e.stopPropagation()
                if (!isString(item) && item.onClick) {
                  item.onClick(makeItem(item))
                  return
                }
                if (onClick) {
                  onClick(makeItem(item))
                }
              }}
              {...(getChildProps ? getChildProps(index) : {})}
            />
          ))}
        </MenuContainer>
      </Container>
      {/* Element to close an open select when blurring it so only one can be open at a time */}
      <div
        tabIndex={0}
        data-cy="operational-ui__ContextMenu-focus-trap"
        onFocus={() => setIsOpen && setIsOpen(false)}
        aria-hidden="true"
      />
    </>
  )
}
export default ContextMenu
