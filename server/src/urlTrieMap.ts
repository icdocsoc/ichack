class TrieNode<V> {
  children: Map<string, TrieNode<V>>;
  value: V;
  terminal: boolean;

  constructor() {
    this.children = new Map();
    this.terminal = false;
    this.value = {} as V;
  }
}

export class UrlTrieMap<V> {
  private root: TrieNode<V>;

  constructor() {
    this.root = new TrieNode();
  }

  public set(key: string, value: V): this {
    let node = this.root;
    const path = key.split('/');

    for (const comp of path) {
      if (!node.children.has(comp)) {
        node.children.set(comp, new TrieNode());
      }
      node = node.children.get(comp)!;
    }
    node.value = value;
    node.terminal = true;
    return this;
  }

  public get(key: string): V | undefined {
    let node = this.root;
    const path = key.split('/');
    for (const comp of path) {
      if (!node.children.has(comp)) {
        return undefined;
      }
      node = node.children.get(comp)!;
    }
    return node.terminal ? node.value : undefined;
  }

  public keys(): string[] {
    const keys: string[] = [];
    const dfs = (node: TrieNode<V>, path: string) => {
      if (node.terminal) {
        keys.push(path);
      }
      for (const [key, child] of node.children) {
        dfs(child, `${path}/${key}`);
      }
    };
    dfs(this.root, '');
    return keys;
  }
}
