export interface FileNode {
  name: string
  path: string
  isDirectory: boolean
  size: number
  modified: number
}

export interface FileResult {
  path: string
  content: string
}

export interface Heading {
  id: string
  text: string
  level: number
}
