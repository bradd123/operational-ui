import * as React from "react"
import {
  contiamoTheme as theme,
  TitleType,
  Heading1Type,
  Heading2Type,
  BodyType,
  SmallType
} from "contiamo-ui-components"

export default (
  <div>
    <TitleType>I am a title.</TitleType>
    <Heading1Type>I am a heading1.</Heading1Type>
    <Heading2Type>I am a heading2.</Heading2Type>
    <BodyType style={{ color: "olive" }}>I am a regular body section. Feel free to paint me olive.</BodyType>
    <SmallType>I am a little smaller than that.</SmallType>
  </div>
)
