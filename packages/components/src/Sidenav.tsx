import * as React from "react"
import glamorous from "glamorous"
import { readableTextColor } from "@operational/utils"
import { Theme, expandColor } from "@operational/theme"

import { sidenavWidth, sidenavExpandedWidth } from "./constants"

export interface Props {
  id?: string | number
  css?: {}
  className?: string
  children?: React.ReactNode
  expanded?: boolean
  expandOnHover?: boolean
}

export interface State {
  isHovered: boolean
}

const Container = glamorous.div(
  ({
    theme,
    fix,
    expanded,
    expandOnHover
  }: {
    theme: Theme
    color?: string
    fix?: boolean
    expandOnHover?: boolean
    expanded?: boolean
  }): {} => {
    const backgroundColor = theme.colors.sidenavBackground
    const color = readableTextColor(backgroundColor, [theme.colors.bodyText, theme.colors.white])
    const hoverWidth = expandOnHover
      ? {
          transition: ".3s width cubic-bezier(.8, 0, 0, 1)",
          willChange: "width",
          "&:hover": {
            width: sidenavExpandedWidth
          }
        }
      : {}

    return {
      backgroundColor,
      color,
      label: "sidenav",
      width: expanded ? sidenavExpandedWidth : sidenavWidth,
      zIndex: theme.baseZIndex + 100,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      height: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      ...hoverWidth,
      "& a:focus": {
        outline: 0
      }
    }
  }
)

class Sidenav extends React.Component<Props, State> {
  state = {
    isHovered: false
  }

  render() {
    return (
      <Container
        key={this.props.id}
        css={this.props.css}
        className={this.props.className}
        expandOnHover={this.props.expandOnHover}
        expanded={this.props.expanded}
        onMouseEnter={() => {
          this.setState(prevState => ({
            isHovered: true
          }))
        }}
        onMouseLeave={() => {
          this.setState(prevState => ({
            isHovered: false
          }))
        }}
      >
        {this.props.children}
      </Container>
    )
  }
}

export default Sidenav
