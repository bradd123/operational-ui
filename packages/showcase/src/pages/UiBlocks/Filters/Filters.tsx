import * as React from "react"

import Table from "../../../components/PropsTable/PropsTable"
import Playground from "../../../components/Playground/Playground"
import { Card, CardHeader, Heading2Type, Select } from "contiamo-ui-components"
import { Filter } from "contiamo-ui-blocks"

import * as simpleSnippet from "./snippets/Filters.simple.snippet"
import propDescription from "./propDescription"

export default () => (
  <Card>
    <CardHeader>Filters</CardHeader>

    <p>
      Filters are opinionated collections of form elements expanded through a modal. They display a very condensed summary of the current form state when the modal is not expanded.
    </p>

    <Heading2Type>Usage</Heading2Type>
    <p>Simply nest `contiamo-ui-components` form elements using their API.</p>
    <Playground snippet={String(simpleSnippet)} components={{ Filter, Select }} />

    <Heading2Type>Props</Heading2Type>
    <Table props={propDescription} />
  </Card>
)

