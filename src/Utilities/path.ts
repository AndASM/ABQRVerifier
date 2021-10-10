import node_path from 'path'
import {fileURLToPath} from 'url'
import Indexable from './indexable'

class Path extends Object implements node_path.ParsedPath {
  constructor(...pathSegments: Path.Like[]) {
    super()
    this.path = node_path.join(...<string[]>pathSegments)
  }
  
  protected _path: string
  
  get path() {
    return this._path
  }
  
  set path(value) {
    this._path = value
    this._parsed = null
  }
  
  get base() {
    return this.parsed.base
  }
  set base(value) {
    this.parsed.base = value
    this.path = this.format
  }
  
  get dir() {
    return this.parsed.dir
  }
  set dir(value) {
    this.parsed.dir = value
    this.path = this.format
  }
  
  get ext() {
    return this.parsed.ext
  }
  set ext(value) {
    this.parsed.ext = value
    this.path = this.format
  }
  
  get name() {
    return this.parsed.name
  }
  set name(value) {
    this.parsed.name = value
    this.path = this.format
  }
  
  get root() {
    return this.parsed.root
  }
  set root(value) {
    this.parsed.root = value
    this.path = this.format
  }
  
  protected _parsed: node_path.ParsedPath
  
  protected get parsed() {
    if (!this._parsed)
      this._parsed = node_path.parse(this._path)
    return this._parsed
  }
  
  get normalize() {
    return new Path(node_path.normalize(this.path))
  }
  
  join(...paths: Path.Like[]) {
    return new Path(this.path, ...paths)
  }
  
  get resolve() {
    return new Path(node_path.resolve(this.path))
  }
  
  get isAbsolute(): boolean {
    return node_path.isAbsolute(this.path)
  }
  
  relativeTo(to: Path.Like): string {
    return node_path.relative(this.path, to.toString())
  }
  
  get format(): string {
    return node_path.format(this)
  }
  
  get namespacePath() {
    return node_path.toNamespacedPath(this.path)
  }
  
  toString(): string {
    return this.path
  }
  
  valueOf(): string {
    return this.path
  }
  
  get basename() {
    return node_path.basename(this.path, this.ext)
  }
}

namespace Path {
  export type Like = Path | string
  export type CollectionLike =
      Map<string, Like>
      | ArrayLike<[string, Like]>
      | Collection
  
  export function getFileDirName(metaUrl: string) {
    const __filename = fileURLToPath(metaUrl)
    const __dirname = node_path.dirname(__filename)
    return {__filename, __dirname}
  }
  
  export class Collection extends Indexable<Collection> {
    protected _paths: Map<string, Path>
    protected _base: Path
    
    [key: string | symbol]: any
    
    constructor(base: Like, paths: CollectionLike) {
      super()
      this._base = new Path(base)
      
      this._paths = new Map<string, Path>(
          Array.from<[string, Path | string], [string, Path]>(paths instanceof Collection ? paths._paths : paths,
              value => {
                if (value[1] instanceof Path)
                  return <[string, Path]>value
                else
                  return [value[0], new Path(value[1]).resolve]
              }))
      this._proxy = true
    }
    
    protected getHandler(p: string | symbol, receiver: any): any {
      return this._paths.get(p.toString())
    }
    
    protected setHandler(p: string | symbol, value: any, receiver: any): boolean {
      try {
        this._paths.set(p.toString(), value)
        return true
      } catch {
        return false
      }
    }
  }
}

export default Path
